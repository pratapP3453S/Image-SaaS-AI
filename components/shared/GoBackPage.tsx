import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function GoBackPage({ linkto, backto } : { linkto: string, backto: string}) {
  return (
      <div className="container mx-auto px-4">
        <button
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors dark:text-slate-300"
      >
        <Link href={linkto}>
        <ArrowLeft className="w-5 h-5 mr-2 inline-block" />
        <span className="text-sm font-medium">{backto}</span>
        </Link>
      </button>
      </div>
  )
}

export default GoBackPage
