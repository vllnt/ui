import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  EraColumn,
  EraComparison,
  EraDomain,
  EraFigure,
  EraHighlight,
} from "./era-comparison";

const meta = {
  component: EraComparison,
  title: "Educational/EraComparison",
} satisfies Meta<typeof EraComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <EraComparison>
      <EraColumn
        color="amber"
        name="Renaissance"
        period="1400–1600"
        region="Europe"
      >
        <EraDomain name="Art">
          <EraHighlight>Perspective painting, humanism</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="Leonardo da Vinci" />
            <EraFigure name="Michelangelo" />
          </div>
        </EraDomain>
        <EraDomain name="Science">
          <EraHighlight>Heliocentrism, anatomy</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="Copernicus" />
            <EraFigure name="Galileo" />
          </div>
        </EraDomain>
        <EraDomain name="Technology">
          <EraHighlight>Printing press, navigation</EraHighlight>
        </EraDomain>
      </EraColumn>
      <EraColumn
        color="emerald"
        name="Islamic Golden Age"
        period="800–1400"
        region="Middle East"
      >
        <EraDomain name="Art">
          <EraHighlight>Geometric patterns, calligraphy</EraHighlight>
        </EraDomain>
        <EraDomain name="Science">
          <EraHighlight>Algebra, optics, astronomy</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="Al-Khwarizmi" />
            <EraFigure name="Ibn al-Haytham" />
          </div>
        </EraDomain>
        <EraDomain name="Technology">
          <EraHighlight>Paper-making, mechanical clocks</EraHighlight>
        </EraDomain>
      </EraColumn>
      <EraColumn
        color="rose"
        name="Edo period"
        period="1603–1868"
        region="Japan"
      >
        <EraDomain name="Art">
          <EraHighlight>Ukiyo-e woodblock prints, kabuki</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="Hokusai" />
            <EraFigure name="Hiroshige" />
          </div>
        </EraDomain>
        <EraDomain name="Science">
          <EraHighlight>Mathematics (wasan)</EraHighlight>
        </EraDomain>
        <EraDomain name="Technology">
          <EraHighlight>Printing, sericulture</EraHighlight>
        </EraDomain>
      </EraColumn>
    </EraComparison>
  ),
};

export const TwoColumn: Story = {
  render: () => (
    <EraComparison>
      <EraColumn color="blue" name="Industrial Revolution" period="1760–1840">
        <EraDomain name="Technology">
          <EraHighlight>Steam, factories, railways</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="James Watt" />
            <EraFigure name="George Stephenson" />
          </div>
        </EraDomain>
        <EraDomain name="Society">
          <EraHighlight>Urbanization, labor unions</EraHighlight>
        </EraDomain>
      </EraColumn>
      <EraColumn color="purple" name="Information Age" period="1970–present">
        <EraDomain name="Technology">
          <EraHighlight>Personal computer, internet, mobile</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure name="Alan Kay" />
            <EraFigure name="Tim Berners-Lee" />
          </div>
        </EraDomain>
        <EraDomain name="Society">
          <EraHighlight>Networked work, global media</EraHighlight>
        </EraDomain>
      </EraColumn>
    </EraComparison>
  ),
};

export const WithFigureLinks: Story = {
  render: () => (
    <EraComparison>
      <EraColumn color="amber" name="Renaissance" period="1400–1600">
        <EraDomain name="Art">
          <EraHighlight>Perspective, humanism</EraHighlight>
          <div className="flex flex-wrap gap-1.5">
            <EraFigure
              href="/figures/da-vinci"
              name="Leonardo da Vinci"
            />
            <EraFigure href="/figures/michelangelo" name="Michelangelo" />
          </div>
        </EraDomain>
      </EraColumn>
    </EraComparison>
  ),
};
