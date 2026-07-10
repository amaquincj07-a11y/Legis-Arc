"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Database,
  HardDrive,
  Info,
  Save,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockUsers } from "@/lib/mock-data";

export default function SettingsPage() {
  const [namingPattern, setNamingPattern] = useState("{TYPE}-{YEAR}-{SEQ}");

  function handleBackup() {
    toast.success("Backup created successfully");
  }

  function handleSaveSettings() {
    toast.success("Settings saved successfully");
  }

  const activeUsers = mockUsers.filter((u) => u.isActive).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          System Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage system configuration, backups, and naming conventions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base">Backup & Restore</CardTitle>
              <CardDescription>
                Create manual backups and view backup history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Last Backup</p>
              <p className="text-xs text-muted-foreground">
                February 17, 2026 at 11:00 PM — Automatic
              </p>
            </div>
            <Button onClick={handleBackup} className="w-full sm:w-auto">
              Create Backup
            </Button>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-2">Backup History</p>
            <div className="space-y-2">
              {[
                {
                  date: "Feb 17, 2026 11:00 PM",
                  type: "Automatic",
                  size: "142 MB",
                },
                {
                  date: "Feb 16, 2026 11:00 PM",
                  type: "Automatic",
                  size: "140 MB",
                },
                {
                  date: "Feb 15, 2026 2:30 PM",
                  type: "Manual",
                  size: "139 MB",
                },
              ].map((backup) => (
                <div
                  key={backup.date}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{backup.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {backup.size}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {backup.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base">System Information</CardTitle>
              <CardDescription>
                Current system status and resource usage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <Settings className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-2xl font-bold">1.0.0</p>
              <p className="text-xs text-muted-foreground">Version</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <HardDrive className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-2xl font-bold">2.4 GB</p>
              <p className="text-xs text-muted-foreground">Storage Used</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Users className="mx-auto mb-2 size-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{activeUsers}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base">Naming Convention</CardTitle>
              <CardDescription>
                Configure the auto-generated document ID pattern
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="namingPattern">Document ID Pattern</Label>
            <Input
              id="namingPattern"
              value={namingPattern}
              onChange={(e) => setNamingPattern(e.target.value)}
              placeholder="{TYPE}-{YEAR}-{SEQ}"
            />
            <p className="text-xs text-muted-foreground">
              Available tokens: {"{TYPE}"} (ORD/RES/MIN), {"{YEAR}"} (e.g.
              2026), {"{SEQ}"} (auto-increment sequence number)
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              Preview:{" "}
              <span className="font-mono font-medium text-foreground">
                {namingPattern
                  .replace("{TYPE}", "ORD")
                  .replace("{YEAR}", "2026")
                  .replace("{SEQ}", "001")}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
          <Save className="mr-2 size-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
