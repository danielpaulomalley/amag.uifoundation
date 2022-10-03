import React, {FC} from 'react'
import { TopNavigationProps } from './TopNavigation.types'

const TopNavigation: FC<TopNavigationProps> = (props) => {
  return (
    <div className="navbar-default">
      {props.children}
    </div>
  )
}
export default TopNavigation;