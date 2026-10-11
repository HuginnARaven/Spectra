import {PricingSection} from "@/features/pricing/components/pricing-section"

export default function PricingPage() {
    return (
        <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-center font-bold text-3xl tracking-tight text-foreground md:text-4xl">
                Our Pricing Plans
            </h1>
            <PricingSection/>
        </div>
    )
}
