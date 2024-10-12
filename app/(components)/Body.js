'use client';
import Entry from "./Entry"

export default function Body({ children }) {
    return (
        <div className="text-center min-h-screen flex h-screen">
            <div className="m-auto max-w-[540px]">
                <h1 className="text-5xl font-bold py-5">
                    Quote Tweet Unnester
                </h1>
                <Entry />
                <div className="pt-4 text-left">
                    <label>
                        <input name="reverse" type='checkbox' className='mr-1 inline-block' onChange={el => { }} />
                        List nested posts in reverse order (oldest to newest)
                    </label>
                    <br />
                    <label>
                        <input name="reverse" type='checkbox' className='mr-1 inline-block' onChange={el => { }} />
                        Don't show posts until all retrieved (useful for avoiding comic spoilers!)
                    </label>
                </div>
                {children}
            </div>
        </div>
    )
}