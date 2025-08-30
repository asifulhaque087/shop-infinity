import { activeSidebarItem } from '@/configs/constants'
import { useAtom } from 'jotai'
import React from 'react'

const useSidebar = () => {
    const [activeSidebar, setActiveSidebar]  = useAtom(activeSidebarItem)
    return {activeSidebar, setActiveSidebar}


  return (
    <div>useSidebar</div>
  )
}

export default useSidebar