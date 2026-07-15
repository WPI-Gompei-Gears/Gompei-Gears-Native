import { Input, SizableText, YStack } from "tamagui";

export default function FormInput({
    title,
    value,
    placeholder,
    disabled,
} : {
    title?: string,
    value?: string,
    placeholder?: string,
    disabled?: boolean,
}) {
    return (
        <YStack>
            {title && (<SizableText>{title}</SizableText>)}
            <Input disabled={disabled} placeholder={placeholder || undefined} value={value}></Input>
        </YStack>
    )
}