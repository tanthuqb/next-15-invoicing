"use client";

import { useState, useEffect } from 'react';

const Logo = () => (
  <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-inner mb-6 mx-auto">
    <svg 
      className="w-10 h-10 text-indigo-600" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  </div>
);

const ProductDisplay = () => (
  <section className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full transition-all hover:shadow-2xl">
      <Logo />
      <div className="mb-8">
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Starter Plan</h3>
        <h5 className="text-xl font-medium text-emerald-600 bg-emerald-50 inline-block px-4 py-1.5 rounded-full">$20.00 / month</h5>
        <p className="mt-4 text-gray-500 text-sm">Perfect for individuals getting started with premium features.</p>
      </div>
      
      <form action="/api/webhook/stripe/session/checkout" method="POST">
        <input type="hidden" name="lookup_key" value="PRICE_LOOKUP_KEY_STARTER_PLAN" />
        <button 
          id="checkout-and-portal-button" 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Subscribe Now
        </button>
      </form>
    </div>
  </section>
);

const SuccessDisplay = ({ sessionId }: { sessionId: string }) => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce shadow-inner">
            <svg 
              className="w-10 h-10 text-emerald-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h3>
        <p className="text-gray-500 mb-8 border-b border-gray-100 pb-8 text-sm">
          Welcome aboard. Your Starter Plan is now active and ready to use.
        </p>
        
        <form action="/api/webhook/stripe/session/portal" method="POST">
          <input
            type="hidden"
            id="session-id"
            name="session_id"
            value={sessionId}
          />
          <button 
            id="checkout-and-portal-button" 
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-md"
          >
            Manage Billing Information
          </button>
        </form>
      </div>
    </section>
  );
};

const Message = ({ message }: { message: string }) => (
  <section className="flex items-center justify-center min-h-[70vh] p-4">
    <div className="bg-red-50 p-6 sm:p-8 rounded-3xl max-w-md w-full border border-red-100 shadow-sm flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 bg-white border border-red-100 rounded-full flex items-center justify-center shadow-sm">
        <svg 
          className="w-8 h-8 text-red-500 shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="font-semibold text-red-800 leading-relaxed text-lg">{message}</p>
    </div>
  </section>
);

export default function CheckoutPage() {
  let [message, setMessage] = useState('');
  let [success, setSuccess] = useState(false);
  let [sessionId, setSessionId] = useState('');
  let [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get('success')) {
      setSuccess(true);
      setSessionId(query.get('session_id') ?? '');
    }

    if (query.get('canceled')) {
      setSuccess(false);
      setMessage(
        "Order canceled — continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  // Prevent Next.js hydration mismatch errors (which can sometimes cause observer errors)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/[0.9] bg-gradient-to-b from-indigo-50/50 to-white selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!success && message === '' ? (
          <ProductDisplay />
        ) : success && sessionId !== '' ? (
          <SuccessDisplay sessionId={sessionId} />
        ) : (
          <Message message={message} />
        )}
      </div>
    </main>
  );
}