import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react'

const CTASection = () => {
  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-card from-50% to-[#12141D] to-50%">
      <section className="py-12 bg-gradient-to-b from-[#A073F0] to-[#7886DD] w-full max-w-5xl rounded-3xl px-6 text-background my-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-bold text-3xl md:text-4xl  mb-4">
            Ready to Get Started with{" "}
            <span className="text-foreground">TradeBoard?</span>
          </h2>
          <p className="text-base mb-8">
            Give trading psychology a chance in your trading journey. Best time
            to upgrade your trading game <br /> with us is NOW.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-background hover:bg-secondary font-semibold text-base py-6 px-5 rounded-xl text-foreground hover:text-primary"
            >
              Sign up with free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CTASection
