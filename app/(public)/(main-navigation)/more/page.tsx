import React from 'react'

const More = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Account Information</h1>
      <section className="space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
          <p>Account Information w/ selected plan</p>
          <p>On current plan : show switch plan or cancel subscription</p>
        </div>
        {/* TODO: Implement these sections */}
        <p>Personalised card with #Number</p>
        <p>How to videos</p>
        <p>Other stuff from YAAS</p>
      </section>
    </div>
  );
}

export default More
