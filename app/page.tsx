import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import ProofSection from "@/components/ProofSection"
import ProblemSection from "@/components/ProblemSection"
import SolutionSection from "@/components/SolutionSection"
import TargetMarkets from "@/components/TargetMarkets"
import TechDifferentiators from "@/components/TechDifferentiators"
import ROICalculator from "@/components/ROICalculator"
import CustomerStories from "@/components/CustomerStories"
import ProductDemo from "@/components/ProductDemo"
import UseCasesSection from "@/components/UseCasesSection"
import PricingSection from "@/components/PricingSection"
import TrustSection from "@/components/TrustSection"
import FAQSection from "@/components/FAQSection"
import FinalCTA from "@/components/FinalCTA"
import StickyBottomCTA from "@/components/StickyBottomCTA"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        {/* <ProofSection /> */}
        <ProblemSection />
        <div id="solution">
          <SolutionSection />
        </div>
        <UseCasesSection />
        {/* <TargetMarkets /> */}
        <TechDifferentiators />
        {/* <ROICalculator /> */}
        {/* <CustomerStories /> */}
        <ProductDemo />
        <div id="pricing">
          <PricingSection />
        </div>
        {/* <TrustSection /> */}
        <FAQSection />
        <div id="contact">
          <FinalCTA />
        </div>
      </main>
      <StickyBottomCTA />
    </>
  )
}