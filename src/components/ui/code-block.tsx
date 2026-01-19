"use client"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { usePreferencesStore, getFontFamilyClass } from "@/store/preferences-store"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
    code: string
    language?: string
    showLineNumbers?: boolean
    className?: string
    maxHeight?: string
}

export function CodeBlock({
    code,
    language = "javascript",
    showLineNumbers = true,
    className,
    maxHeight = "400px"
}: CodeBlockProps) {
    const { codeFontSize, codeFontFamily } = usePreferencesStore()
    const { resolvedTheme } = useTheme()

    const fontFamilyClass = getFontFamilyClass(codeFontFamily)
    const isDark = resolvedTheme === "dark"

    return (
        <div className={cn("rounded-lg overflow-hidden", className)}>
            <SyntaxHighlighter
                language={language}
                style={isDark ? oneDark : oneLight}
                showLineNumbers={showLineNumbers}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: `${codeFontSize}px`,
                    maxHeight: maxHeight,
                    overflow: "auto",
                    borderRadius: "0.5rem",
                }}
                codeTagProps={{
                    className: fontFamilyClass,
                    style: {
                        fontFamily: codeFontFamily === 'mono'
                            ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                            : codeFontFamily === 'sans'
                                ? 'ui-sans-serif, system-ui, sans-serif'
                                : 'ui-serif, Georgia, serif'
                    }
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    )
}
