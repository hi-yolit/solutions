import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { footerLinks } from "@/constants/links"
import { Calculator } from 'lucide-react'

const More = () => {
  return (
    <div className="container mx-auto py-16 px-4 max-w-7xl">

      {/* Learning Tools Grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Our Learning Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Homework Assistant */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <Image
                src="/AssistantFemaleAvatar.svg"
                width={48}
                height={48}
                alt="Homework Assistant"
                className="flex-shrink-0"
              />
              <div>
                <h3 className="text-lg font-semibold">Homework Assistant</h3>
                <p className="text-gray-600">Get step-by-step help with your assignments</p>
              </div>
            </div>
            <Link href="/admin/resources">
              <Button className="w-full">
                Start Asking
              </Button>
            </Link>
          </div>

          {/* APS Calculator */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">APS Calculator</h3>
                <p className="text-gray-600">Calculate and track your admission points</p>
              </div>
            </div>
            <Link href="">
              <Button className="w-full">
                Calculate Now
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* YAAS Logo Header */}
      <div className="mb-8 lg:basis-5/12 lg:pr-2">
        <Image src='/YAAS_logo.svg' width={120} height={80} alt="YAAS | Yolit Academy of Art & Sciences logo" />
        <p className="mt-4 text-gray-700">
          Creating helpful tools for high school students, teachers, and tutors to make
          everyone better at learning and teaching.
        </p>

        {/* Social Media Logos in a row */}
        <div className="flex items-center gap-4 py-4">
          {footerLinks[0].links.map((link) => (
            <Link href={link.url} key={link.url} className="hover:opacity-80 transition">
              {"iconUrl" in link && (
                <Image src={link.iconUrl} width={24} height={24} alt={link.title} />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default More
