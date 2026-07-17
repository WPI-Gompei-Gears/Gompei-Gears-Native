import { Check } from "@tamagui/lucide-icons-2"
import { Checkbox, CheckboxProps, Label, XStack } from "tamagui"

export default function CheckboxWithLabel({
  size,
  label = 'Accept terms and conditions',
  disabled,
  ...checkboxProps
}: CheckboxProps & { label?: string }) {
  const id = `checkbox-${(size || '').toString().slice(1)}`
  return (
    <XStack items="center" gap="$4">
        <Checkbox id={id} size={size} disabled={disabled} {...checkboxProps}>
            <Checkbox.Indicator>
                <Check />
            </Checkbox.Indicator>
        </Checkbox>

        <Label size={size} htmlFor={id} opacity={disabled ? 0.5 : 1}>
            {label}
        </Label>
    </XStack>
  )
}