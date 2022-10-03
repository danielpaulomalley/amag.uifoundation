import React from "react"
import { Button } from "../components"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { ButtonPropTypes } from "../components/Button/Button"

export default {
	title: "Button",
	component: Button,
} as ComponentMeta<typeof Button>


const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Hello</Button>

export const Primary = Template.bind({})
const props: ButtonPropTypes = {
  label: "Button"
}
Primary.args = props
