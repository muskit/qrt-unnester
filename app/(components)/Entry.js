'use client';

import { useSearchParams } from "next/navigation";

function Input() {
    const [searchParam, _] = useSearchParams()
    if (searchParam != undefined) {
        return <input name="url" type="text" className="mb-2 px-2 rounded-sm w-full border-2" placeholder="Enter nested X post URL here..." defaultValue={searchParam[1]} />
    }
    return <input name="url" type="text" className="mb-2 px-2 rounded-md w-full border-2" placeholder="Enter nested X post URL here..." />
}

export default function Entry() {
    return (
        <form className="flex flex-col items-center">
            <Input />
            <button className="bg-slate-100 rounded-md py-1 px-3">Unravel!</button>
        </form>
    )
}