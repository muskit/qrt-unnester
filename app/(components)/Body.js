'use client';
import Entry from "./Entry"

export default function Body({ children }) {
    return (
        <div className="text-center min-h-screen flex h-screen">
            <div className="m-auto max-w-[540px]">
                <div className="py-5">
                    <h1 className="text-5xl font-bold ">
                        Quote Tweet Unnester
                    </h1>
                    <b className="text-xl">Indev!</b>
                </div>
                <Entry />
                <div className="pt-4 text-left">
                    <label>
                        <input name="reverse" type='checkbox' className='mr-1 inline-block' onChange={el => { }} />
                        List nested posts in reverse order (oldest to newest)
                    </label>
                    <br />
                    <label>
                        <input name="reverse" type='checkbox' className='mr-1 inline-block' onChange={el => { }} />
                        Don&apos;t show posts until all retrieved (useful for avoiding comic spoilers!)
                    </label>
                </div>
                {children}
            </div>
        </div>
    )
}