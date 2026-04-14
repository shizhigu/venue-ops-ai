import { streamText, tool, convertToModelMessages, createStreamDataTransformer } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';

// Initialize OpenRouter
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Initialize Neon database client
const sql = neon(process.env.DATABASE_URL!);

// Define tools (these are your venue operations functions)
const tools = {
  getPendingTasks: tool({
    description: 'Get pending tasks for a venue',
    parameters: z.object({
      venue_id: z.string(),
      priority_filter: z.number().min(1).max(5).optional(),
      limit: z.number().default(10).optional(),
    }),
    execute: async ({ venue_id, priority_filter, limit = 10 }) => {
      try {
        console.log('Fetching tasks for venue:', venue_id);
        console.log('Priority filter:', priority_filter);
        console.log('Limit:', limit);
        
        // Query the database using Neon
        let tasks;
        
        if (priority_filter) {
          tasks = await sql`
            SELECT id, data, status, created_at
            FROM tasks
            WHERE venue_id = ${venue_id} 
            AND status IN ('pending', 'active')
            AND (data->>'priority')::int >= ${priority_filter}
            ORDER BY (data->>'priority')::int DESC, created_at ASC
            LIMIT ${limit}
          `;
        } else {
          tasks = await sql`
            SELECT id, data, status, created_at
            FROM tasks
            WHERE venue_id = ${venue_id} 
            AND status IN ('pending', 'active')
            ORDER BY (data->>'priority')::int DESC, created_at ASC
            LIMIT ${limit}
          `;
        }
        
        console.log('Query executed, result count:', tasks?.length || 0);
        console.log('Raw task data from database:', JSON.stringify(tasks, null, 2));
        
        // If no tasks found, return empty result
        if (!tasks || tasks.length === 0) {
          return {
            data_type: 'task_list',
            data: {
              tasks: [],
              total_count: 0,
              message: 'No pending tasks found'
            }
          };
        }
        
        // Parse the actual database results
        const parsedTasks = tasks.map(task => ({
          id: task.id,
          status: task.status,
          created_at: task.created_at,
          description: task.data?.description || 'No description',
          priority: task.data?.priority || 3,
          location: task.data?.location || {},
          type: task.data?.type || task.data?.issue_type || 'unknown',
        }));
        
        return {
          data_type: 'task_list',
          data: {
            tasks: parsedTasks,
            total_count: parsedTasks.length
          }
        };
      } catch (error) {
        console.error('Error in getPendingTasks:', error);
        // Return error information
        return {
          data_type: 'error',
          data: {
            error: error.message || 'Failed to fetch tasks',
            details: error.toString()
          }
        };
      }
    },
  }),

  getTaskDetails: tool({
    description: 'Get detailed information about a specific task',
    parameters: z.object({
      task_id: z.string(),
    }),
    execute: async ({ task_id }) => {
      const tasks = await sql`
        SELECT * FROM tasks WHERE id = ${task_id}
      `;
      
      if (!tasks || tasks.length === 0) {
        throw new Error('Task not found');
      }
      
      const task = tasks[0];
      
      // Get available workers
      const workers = await sql`
        SELECT * FROM users 
        WHERE venue_id = ${task.venue_id} AND role = 'worker'
      `;
      
      return {
        data_type: 'task_detail',
        id: task.id,
        status: task.status,
        created_at: task.created_at,
        description: task.data?.description,
        priority: task.data?.priority || 3,
        location: task.data?.location || {},
        type: task.data?.issue_type || 'unknown',
        ai_analysis: task.data?.ai_analysis || {},
        images: task.data?.images || [],
        available_workers: workers.map(w => ({
          id: w.id,
          name: w.name,
          skills: w.skills || [],
        })),
      };
    },
  }),

  assignTaskToWorker: tool({
    description: 'Assign a task to a worker',
    parameters: z.object({
      task_id: z.string(),
      worker_id: z.string(),
    }),
    execute: async ({ task_id, worker_id }) => {
      const result = await sql`
        UPDATE tasks 
        SET 
          assignee_id = ${worker_id},
          status = 'assigned',
          updated_at = NOW()
        WHERE id = ${task_id}
        RETURNING *
      `;
      
      if (!result || result.length === 0) {
        throw new Error('Failed to assign task');
      }
      
      const task = result[0];
      
      // Create event log
      await sql`
        INSERT INTO events (venue_id, type, target_type, target_id, data)
        VALUES (
          ${task.venue_id},
          'task_assigned',
          'task',
          ${task_id},
          ${JSON.stringify({
            assigned_to: worker_id,
            assigned_by: 'AI Deputy',
          })}
        )
      `;
      
      return {
        success: true,
        task: {
          id: task.id,
          status: task.status,
          assignee_id: task.assignee_id,
        },
      };
    },
  }),

  getVenueStatistics: tool({
    description: 'Get venue statistics and overview',
    parameters: z.object({
      venue_id: z.string(),
    }),
    execute: async ({ venue_id }) => {
      // Get task statistics
      const taskStats = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'completed' AND DATE(updated_at) = CURRENT_DATE) as completed_today,
          COUNT(*) FILTER (WHERE (data->>'priority')::int >= 4 AND status IN ('pending', 'active')) as urgent_count
        FROM tasks
        WHERE venue_id = ${venue_id}
      `;
      
      // Get worker statistics
      const workerStats = await sql`
        SELECT 
          COUNT(DISTINCT u.id) as total_workers,
          COUNT(DISTINCT u.id) FILTER (WHERE t.id IS NULL OR t.status != 'active') as available_workers
        FROM users u
        LEFT JOIN tasks t ON t.assignee_id = u.id AND t.status = 'active'
        WHERE u.venue_id = ${venue_id} AND u.role = 'worker'
      `;
      
      const stats = taskStats[0] || {};
      const workers = workerStats[0] || {};
      
      return {
        data_type: 'statistics',
        tasks: {
          pending: parseInt(stats.pending_count) || 0,
          active: parseInt(stats.active_count) || 0,
          completed_today: parseInt(stats.completed_today) || 0,
          urgent: parseInt(stats.urgent_count) || 0,
        },
        workers: {
          total: parseInt(workers.total_workers) || 0,
          available: parseInt(workers.available_workers) || 0,
          busy: (parseInt(workers.total_workers) || 0) - (parseInt(workers.available_workers) || 0),
        },
      };
    },
  }),
};

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, venueId } = body;
  
  console.log('Full request body:', body);
  console.log('Received venueId from request:', venueId);
  
  // Define system prompt based on context
  const systemPrompt = `You are an AI Deputy for venue operations management.
  
  You help managers by:
  - Monitoring and managing tasks
  - Assigning tasks to workers
  - Providing venue statistics and insights
  - Answering questions about operations
  
  IMPORTANT: Current venue ID is: ${venueId || '00000000-0000-0000-0000-000000000001'}
  When calling ANY tool that requires venue_id, you MUST use this venue ID: ${venueId || '00000000-0000-0000-0000-000000000001'}
  
  Be conversational and helpful. For casual greetings like "what's up", "hello", etc., 
  respond naturally without calling tools unless explicitly asked.
  
  When calling tools, remember to pass the correct parameters:
  - "Show me pending tasks" -> Call getPendingTasks with venue_id="${venueId || '00000000-0000-0000-0000-000000000001'}"
  - "What are the venue statistics" -> Call getVenueStatistics with venue_id="${venueId || '00000000-0000-0000-0000-000000000001'}"
  - "Assign task X to worker Y" -> Call assignTaskToWorker with task_id and worker_id
  - "Show details for task X" -> Call getTaskDetails with task_id
  
  Format your responses in a friendly, conversational way.`;
  
  // Convert UI messages to model messages format
  const modelMessages = convertToModelMessages(messages);
  
  const result = await streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...modelMessages,
    ],
    tools,
    maxSteps: 3, // Allow up to 3 tool calls in sequence
    onStepFinish: async ({ toolCalls, toolResults }) => {
      // Log tool usage for debugging
      if (toolCalls?.length) {
        console.log('Tools called:', toolCalls.map(tc => tc.toolName));
        console.log('Tool call arguments:', toolCalls.map(tc => ({ name: tc.toolName, args: tc.args })));
      }
      if (toolResults?.length) {
        console.log('Tool results:', toolResults);
      }
    },
  });
  
  console.log('Streaming response started');
  
  // Return UI message stream response for useChat hook
  return result.toUIMessageStreamResponse();
}