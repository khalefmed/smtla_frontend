import React from 'react'
import { StatsCard } from '../shared/statsCard'

export const StatsContainer = () => {

    
    return (
        <div className="w-full flex flex-row max-sm:flex-col max-sm:gap-3 justify-between ">
            <StatsCard/>
            <StatsCard/>
            <StatsCard/>
        </div>
    )
}
