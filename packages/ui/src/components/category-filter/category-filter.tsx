'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '../badge'

type CategoryFilterProps = {
  categories: string[]
  lang: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '') // Remove diacritics
    .replaceAll(/[^\s\w-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
    .replaceAll(/-+/g, '-') // Collapse consecutive hyphens
    .replaceAll(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function CategoryFilter({ categories, lang }: CategoryFilterProps) {
  const pathname = usePathname()

  // Get all unique categories and sort them
  // eslint-disable-next-line unicorn/prefer-spread
  const allCategories: string[] = Array.from(new Set(categories)).sort()

  if (allCategories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => {
        const categorySlug = slugify(category)
        const isSelected = pathname.includes(`/${categorySlug}`)
        const href = `/${lang}/${categorySlug}`

        if (isSelected) {
          return (
            <Badge className="cursor-default" key={category} variant="default">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          )
        }

        return (
          <Link href={href} key={category}>
            <Badge
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              variant="secondary"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
