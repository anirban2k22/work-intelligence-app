"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Layers, Users, Heart, Search, Target, Briefcase, Activity, type LucideIcon } from "lucide-react";
import { KRA, MOCK_KRAS } from "./types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconMap: Record<string, LucideIcon> = {
  layers: Layers,
  users: Users,
  heart: Heart,
  search: Search,
  target: Target,
  briefcase: Briefcase,
  activity: Activity,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function KraManager() {
  const [kras, setKras] = useState<KRA[]>(MOCK_KRAS);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingKra, setEditingKra] = useState<KRA | null>(null);
  const [deletingKra, setDeletingKra] = useState<KRA | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<KRA>>({
    name: "",
    description: "",
    weight: 0,
    color: "blue",
    icon: "target",
    category: "",
    frequency: "Weekly",
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingKra(null);
    setFormData({
      name: "",
      description: "",
      weight: 0,
      color: "blue",
      icon: "target",
      category: "",
      frequency: "Weekly",
      active: true,
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (kra: KRA) => {
    setEditingKra(kra);
    setFormData(kra);
    setIsAddEditModalOpen(true);
  };

  const handleOpenDelete = (kra: KRA) => {
    setDeletingKra(kra);
    setIsDeleteModalOpen(true);
  };

  const handleSave = () => {
    if (editingKra) {
      setKras(kras.map(k => (k.id === editingKra.id ? { ...k, ...formData } as KRA : k)));
    } else {
      const newKra: KRA = {
        ...(formData as KRA),
        id: Math.random().toString(36).substr(2, 9),
      };
      setKras([...kras, newKra]);
    }
    setIsAddEditModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingKra) {
      setKras(kras.filter(k => k.id !== deletingKra.id));
      setIsDeleteModalOpen(false);
    }
  };

  const toggleActive = (id: string, active: boolean) => {
    setKras(kras.map(k => (k.id === id ? { ...k, active } : k)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Key Result Areas</h3>
          <p className="text-sm text-muted-foreground">
            Manage the responsibility areas the AI uses to attribute your work.
          </p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add KRA
        </Button>
      </div>

      {kras.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center gap-4 bg-muted/20">
          <Target className="w-10 h-10 text-muted-foreground" />
          <div>
            <h4 className="text-sm font-medium">No KRAs found</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first Key Result Area to help the AI categorize your work.
            </p>
          </div>
          <Button variant="outline" onClick={handleOpenAdd} className="mt-2">
            Create KRA
          </Button>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KRA</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kras.map((kra) => {
                const Icon = iconMap[kra.icon] || Target;
                return (
                  <TableRow key={kra.id} className={!kra.active ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-md ${colorMap[kra.color] || colorMap.gray}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{kra.name}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{kra.description}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">
                        {kra.category || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{kra.frequency}</TableCell>
                    <TableCell className="text-sm">{kra.weight}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={kra.active} 
                          onCheckedChange={(checked) => toggleActive(kra.id, checked)}
                          aria-label="Toggle active status"
                        />
                        <span className="text-xs text-muted-foreground">
                          {kra.active ? "Active" : "Archived"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(kra)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(kra)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isAddEditModalOpen} onOpenChange={setIsAddEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingKra ? "Edit KRA" : "Add Key Result Area"}</DialogTitle>
            <DialogDescription>
              {editingKra ? "Make changes to your KRA below." : "Create a new KRA for the AI to track your work against."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Platform Architecture" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Briefly describe this KRA..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  placeholder="e.g. Engineering" 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={formData.frequency || ""} 
                  onValueChange={(value) => setFormData({ ...formData, frequency: value as KRA["frequency"] })}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (%)</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Select 
                  value={formData.color || ""} 
                  onValueChange={(value) => setFormData({ ...formData, color: value as string })}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Switch 
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingKra ? "Save Changes" : "Create KRA"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete KRA</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{deletingKra?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete KRA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
