"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";

export default function TabsPreview() {
  return (
    <Tabs className="w-full max-w-md" defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground">
          Manage your account here.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground">
          Change your password here.
        </p>
      </TabsContent>
    </Tabs>
  );
}
