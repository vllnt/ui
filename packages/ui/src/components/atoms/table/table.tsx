import { named } from "../../../lib/named";
import { cn } from "../../../lib/utils";

const Table = /* @__PURE__ */ named(
  "Table",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableElement> & {
    ref?: React.Ref<HTMLTableElement>;
  }) => (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        data-slot="table"
        ref={ref}
        {...props}
      />
    </div>
  ),
);

const TableHeader = /* @__PURE__ */ named(
  "TableHeader",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement> & {
    ref?: React.Ref<HTMLTableSectionElement>;
  }) => (
    <thead
      className={cn("[&_tr]:border-b", className)}
      data-slot="table-header"
      ref={ref}
      {...props}
    />
  ),
);

const TableBody = /* @__PURE__ */ named(
  "TableBody",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement> & {
    ref?: React.Ref<HTMLTableSectionElement>;
  }) => (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      ref={ref}
      {...props}
    />
  ),
);

const TableFooter = /* @__PURE__ */ named(
  "TableFooter",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement> & {
    ref?: React.Ref<HTMLTableSectionElement>;
  }) => (
    <tfoot
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      data-slot="table-footer"
      ref={ref}
      {...props}
    />
  ),
);

const TableRow = /* @__PURE__ */ named(
  "TableRow",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableRowElement> & {
    ref?: React.Ref<HTMLTableRowElement>;
  }) => (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-secondary/50 data-[state=selected]:bg-secondary",
        className,
      )}
      data-slot="table-row"
      ref={ref}
      {...props}
    />
  ),
);

const TableHead = /* @__PURE__ */ named(
  "TableHead",
  ({
    className,
    ref,
    ...props
  }: React.ThHTMLAttributes<HTMLTableCellElement> & {
    ref?: React.Ref<HTMLTableCellElement>;
  }) => (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      data-slot="table-head"
      ref={ref}
      {...props}
    />
  ),
);

const TableCell = /* @__PURE__ */ named(
  "TableCell",
  ({
    className,
    ref,
    ...props
  }: React.TdHTMLAttributes<HTMLTableCellElement> & {
    ref?: React.Ref<HTMLTableCellElement>;
  }) => (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className,
      )}
      data-slot="table-cell"
      ref={ref}
      {...props}
    />
  ),
);

const TableCaption = /* @__PURE__ */ named(
  "TableCaption",
  ({
    className,
    ref,
    ...props
  }: React.HTMLAttributes<HTMLTableCaptionElement> & {
    ref?: React.Ref<HTMLTableCaptionElement>;
  }) => (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      data-slot="table-caption"
      ref={ref}
      {...props}
    />
  ),
);

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
