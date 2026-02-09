import { expect, test } from '@playwright/experimental-ct-react'

import { AreaChart } from './area-chart'
import { BarChart } from './bar-chart'
import { LineChart } from './line-chart'

const sampleData = [
  { label: 'Jan', value: 10 },
  { label: 'Feb', value: 25 },
  { label: 'Mar', value: 15 },
  { label: 'Apr', value: 30 },
  { label: 'May', value: 20 },
]

test.describe('AreaChart', () => {
  test('default', async ({ mount }) => {
    const component = await mount(<AreaChart data={sampleData} />)
    await expect(component).toHaveScreenshot()
  })

  test('custom dimensions', async ({ mount }) => {
    const component = await mount(<AreaChart data={sampleData} height={200} width={400} />)
    await expect(component).toHaveScreenshot()
  })

  test('custom color', async ({ mount }) => {
    const component = await mount(<AreaChart color="#3b82f6" data={sampleData} />)
    await expect(component).toHaveScreenshot()
  })
})

test.describe('BarChart', () => {
  test('default', async ({ mount }) => {
    const component = await mount(<BarChart data={sampleData} />)
    await expect(component).toHaveScreenshot()
  })

  test('custom dimensions', async ({ mount }) => {
    const component = await mount(<BarChart data={sampleData} height={200} width={400} />)
    await expect(component).toHaveScreenshot()
  })
})

test.describe('LineChart', () => {
  test('default', async ({ mount }) => {
    const component = await mount(<LineChart data={sampleData} />)
    await expect(component).toHaveScreenshot()
  })

  test('custom dimensions', async ({ mount }) => {
    const component = await mount(<LineChart data={sampleData} height={200} width={400} />)
    await expect(component).toHaveScreenshot()
  })

  test('custom color', async ({ mount }) => {
    const component = await mount(<LineChart color="#3b82f6" data={sampleData} />)
    await expect(component).toHaveScreenshot()
  })
})
