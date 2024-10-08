'use client';

import Entry from "./Entry"

export default function Body({ children }) {
    return (
        <div className="text-center min-h-screen flex h-screen">
            <div className="m-auto max-w-[540px]">
                <h1 className="text-5xl font-bold pb-5">
                    Quote Tweet Unnester
                </h1>
                <Entry />
                <div className="pt-4">
                    <input type='checkbox' className='mr-1 inline-block' onChange={el => { }} />
                    <span className="inline-block">List nested posts in reverse order</span>
                </div>
                <div className="p-12" />
                {children}
            </div>
        </div>
    )
}