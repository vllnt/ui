// Generic content types for tutorial/educational systems
// Apps can extend these with app-specific fields (SEO, frontmatter, etc.)

/**
 * Difficulty levels for educational content
 */
export type DifficultyLevel = 'advanced' | 'beginner' | 'intermediate'

/**
 * Generic content section extracted from MDX/Markdown
 * Used for tutorials, guides, documentation, etc.
 */
export type ContentSection = {
  /** Raw markdown/MDX content for this section */
  content: string
  /** First paragraph excerpt for previews */
  description: string
  /** Line number where section ends (for source mapping) */
  endLine: number
  /** URL-safe slug identifier */
  id: string
  /** 0-based position in content */
  index: number
  /** Line number where section starts (for source mapping) */
  startLine: number
  /** Section heading text */
  title: string
}

/**
 * Minimal section for UI components (no source mapping)
 */
export type ContentSectionMinimal = {
  id: string
  title: string
}

/**
 * Progress tracking for content sections
 */
export type ContentProgress = {
  completedCount: number
  totalSections: number
}

/**
 * Generic content metadata for cards/listings
 */
export type ContentMeta = {
  /** Cross-language content identifier */
  contentId: string
  /** Publication date (ISO format) */
  date: string
  /** Short description */
  description: string
  /** Difficulty level */
  difficulty: DifficultyLevel
  /** Estimated completion time (e.g., "45 min") */
  estimatedTime: string
  /** Optional excerpt */
  excerpt?: string
  /** Number of sections */
  sectionCount: number
  /** URL slug */
  slug: string
  /** Content tags */
  tags: string[]
  /** Content title */
  title: string
}

/**
 * Full content with sections
 */
export type Content<TSection extends ContentSectionMinimal = ContentSection> = ContentMeta & {
  /** Full MDX/Markdown content */
  content: string
  /** Extracted sections */
  sections: TSection[]
}
