import { Card } from '@/components/ui/card'
import React from 'react'

const Page = () => {
  return (
    <div>
      <div className=""></div>
      <div className="grid md:grid-cols-5 grid-cols-1 gap-3 p-3">
        <div className="">
          <Card className="h-screen"></Card>
        </div>
        <div className="col-span-4">
          <Card>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page