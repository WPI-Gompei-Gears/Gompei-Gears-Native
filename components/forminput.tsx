import { Input, SizableText, YStack } from "tamagui";

export default function FormInput({
    title,
    value,
    placeholder,
    disabled,
    onChangeText,
} : {
    title?: string,
    value?: string,
    placeholder?: string,
    disabled?: boolean,
    onChangeText?: (text: string) => void,
}) {
    return (
        <YStack>
            {title && (<SizableText>{title}</SizableText>)}
            <Input disabled={disabled} placeholder={placeholder || undefined} value={value} onChangeText={onChangeText}></Input>
        </YStack>
    )
}