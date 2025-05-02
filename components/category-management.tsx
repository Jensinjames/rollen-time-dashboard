"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Edit, Trash2, Settings, GripVertical, Search, SortDesc, Tag } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useWellness } from "@/context/wellness-context"
import type { WellnessCategory, WellnessMetric, WellnessSubcategory } from "@/types/wellness"
import { getCategoryIcon } from "@/components/custom-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define Zod schema for category form
const categoryFormSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^[a-z0-9-]+$/, "ID must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Category name must be at least 2 characters."),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
})

// Define Zod schema for metric form
const metricFormSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^[a-z0-9-]+$/, "ID must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Metric name must be at least 2 characters."),
  description: z.string().min(1, "Description is required"),
  unit: z.string().min(1, "Unit is required"),
  min: z.number().min(0, "Minimum value must be at least 0"),
  max: z.number().min(1, "Maximum value must be at least 1"),
  step: z.number().min(0.1, "Step must be at least 0.1"),
  defaultValue: z.number(),
  defaultGoal: z.number(),
  type: z.enum(["time", "value", "boolean"]).optional(),
})

// Define Zod schema for subcategory form
const subcategoryFormSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^[a-z0-9-]+$/, "ID must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().min(2, "Subcategory name must be at least 2 characters."),
  description: z.string().min(1, "Description is required"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().optional(),
})

// Define available colors
const availableColors = [
  { name: "Slate", value: "slate" },
  { name: "Gray", value: "gray" },
  { name: "Zinc", value: "zinc" },
  { name: "Neutral", value: "neutral" },
  { name: "Stone", value: "stone" },
  { name: "Red", value: "red" },
  { name: "Orange", value: "orange" },
  { name: "Amber", value: "amber" },
  { name: "Yellow", value: "yellow" },
  { name: "Lime", value: "lime" },
  { name: "Green", value: "green" },
  { name: "Emerald", value: "emerald" },
  { name: "Teal", value: "teal" },
  { name: "Cyan", value: "cyan" },
  { name: "Sky", value: "sky" },
  { name: "Blue", value: "blue" },
  { name: "Indigo", value: "indigo" },
  { name: "Violet", value: "violet" },
  { name: "Purple", value: "purple" },
  { name: "Fuchsia", value: "fuchsia" },
  { name: "Pink", value: "pink" },
  { name: "Rose", value: "rose" },
]

// Define available units
const availableUnits = [
  { name: "Minutes", value: "minutes" },
  { name: "Hours", value: "hours" },
  { name: "Percent", value: "percent" },
  { name: "Count", value: "count" },
  { name: "Level", value: "level" },
  { name: "Custom", value: "custom" },
]

// Define available metric types
const availableMetricTypes = [
  { name: "Time", value: "time" },
  { name: "Value", value: "value" },
  { name: "Boolean", value: "boolean" },
]

export function CategoryManagement() {
  const {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    filterCategories,
    sortCategories,
  } = useWellness()

  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<WellnessCategory | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showAddMetric, setShowAddMetric] = useState(false)
  const [editingMetric, setEditingMetric] = useState<{ categoryId: string; metric: WellnessMetric } | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([])
  const [showAddSubcategory, setShowAddSubcategory] = useState<string | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string
    subcategory: WellnessSubcategory
  } | null>(null)
  const [showDeleteSubcategoryConfirm, setShowDeleteSubcategoryConfirm] = useState<{
    categoryId: string
    subcategoryId: string
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "lastUpdated">("name")
  const [activeTab, setActiveTab] = useState("categories")

  // Get all available Lucide icons
  const availableIcons = Object.keys(LucideIcons)
    .filter((key) => typeof LucideIcons[key as keyof typeof LucideIcons] === "function" && key !== "createLucideIcon")
    .sort()

  // Form for adding/editing categories
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      icon: "Activity",
      color: "blue",
    },
  })

  // Form for adding/editing metrics
  const metricForm = useForm<z.infer<typeof metricFormSchema>>({
    resolver: zodResolver(metricFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      unit: "minutes",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 0,
      defaultGoal: 50,
      type: "time",
    },
  })

  // Form for adding/editing subcategories
  const subcategoryForm = useForm<z.infer<typeof subcategoryFormSchema>>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      color: "blue",
      icon: "",
    },
  })

  // Filter categories based on search term
  const filteredCategories = searchTerm ? filterCategories(searchTerm) : categories

  // Sort categories based on selected criteria
  const sortedCategories = sortBy ? sortCategories(sortBy) : filteredCategories

  // Reset and initialize category form for adding a new category
  const handleAddCategory = () => {
    setEditingCategory(null)
    categoryForm.reset({
      id: "",
      name: "",
      description: "",
      icon: "Activity",
      color: "blue",
    })
    setOpen(true)
  }

  // Initialize category form for editing an existing category
  const handleEditCategory = (category: WellnessCategory) => {
    setEditingCategory(category)
    categoryForm.reset({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    })
    setOpen(true)
  }

  // Handle category form submission
  const onCategorySubmit = (data: z.infer<typeof categoryFormSchema>) => {
    const categoryData: WellnessCategory = {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      enabled: true,
      metrics: editingCategory?.metrics || [],
      subcategories: editingCategory?.subcategories || [],
    }

    if (editingCategory) {
      // Update existing category
      updateCategory(editingCategory.id, categoryData)
      toast({
        title: "Category updated",
        description: `The category "${data.name}" has been updated.`,
      })
    } else {
      // Add new category
      addCategory(categoryData)
      toast({
        title: "Category added",
        description: `The category "${data.name}" has been added.`,
      })
    }

    setOpen(false)
  }

  // Initialize metric form for adding a new metric
  const handleAddMetric = (categoryId: string) => {
    setEditingMetric(null)
    metricForm.reset({
      id: "",
      name: "",
      description: "",
      unit: "minutes",
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 0,
      defaultGoal: 50,
      type: "time",
    })
    setShowAddMetric(categoryId)
  }

  // Initialize metric form for editing an existing metric
  const handleEditMetric = (categoryId: string, metric: WellnessMetric) => {
    setEditingMetric({ categoryId, metric })
    metricForm.reset({
      id: metric.id,
      name: metric.name,
      description: metric.description || "",
      unit: metric.unit,
      min: metric.min,
      max: metric.max,
      step: metric.step,
      defaultValue: metric.defaultValue,
      defaultGoal: metric.defaultGoal,
      type: metric.type || "time",
    })
    setShowAddMetric(categoryId)
  }

  // Handle metric form submission
  const onMetricSubmit = (data: z.infer<typeof metricFormSchema>) => {
    const metricData: WellnessMetric = {
      id: data.id,
      name: data.name,
      description: data.description,
      unit: data.unit,
      min: data.min,
      max: data.max,
      step: data.step,
      defaultValue: data.defaultValue,
      defaultGoal: data.defaultGoal,
      type: data.type,
    }

    const categoryId = showAddMetric

    if (!categoryId) return

    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    let updatedMetrics: WellnessMetric[]

    if (editingMetric) {
      // Update existing metric
      updatedMetrics = category.metrics.map((m) => (m.id === editingMetric.metric.id ? metricData : m))
      toast({
        title: "Metric updated",
        description: `The metric "${data.name}" has been updated.`,
      })
    } else {
      // Add new metric
      updatedMetrics = [...category.metrics, metricData]
      toast({
        title: "Metric added",
        description: `The metric "${data.name}" has been added to the "${category.name}" category.`,
      })
    }

    updateCategory(categoryId, { metrics: updatedMetrics })
    setShowAddMetric("")
    setEditingMetric(null)
  }

  // Initialize subcategory form for adding a new subcategory
  const handleAddSubcategory = (categoryId: string) => {
    setEditingSubcategory(null)
    subcategoryForm.reset({
      id: "",
      name: "",
      description: "",
      color: "blue",
      icon: "",
    })
    setShowAddSubcategory(categoryId)
  }

  // Initialize subcategory form for editing an existing subcategory
  const handleEditSubcategory = (categoryId: string, subcategory: WellnessSubcategory) => {
    setEditingSubcategory({ categoryId, subcategory })
    subcategoryForm.reset({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description,
      color: subcategory.color,
      icon: subcategory.icon || "",
    })
    setShowAddSubcategory(categoryId)
  }

  // Handle subcategory form submission
  const onSubcategorySubmit = (data: z.infer<typeof subcategoryFormSchema>) => {
    const subcategoryData: WellnessSubcategory = {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
    }

    const categoryId = showAddSubcategory

    if (!categoryId) return

    if (editingSubcategory) {
      // Update existing subcategory
      updateSubcategory(categoryId, subcategoryData.id, subcategoryData)
      toast({
        title: "Subcategory updated",
        description: `The subcategory "${data.name}" has been updated.`,
      })
    } else {
      // Add new subcategory
      addSubcategory(categoryId, subcategoryData)
      toast({
        title: "Subcategory added",
        description: `The subcategory "${data.name}" has been added.`,
      })
    }

    setShowAddSubcategory(null)
    setEditingSubcategory(null)
  }

  // Handle metric deletion
  const handleDeleteMetric = (categoryId: string, metricId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const updatedMetrics = category.metrics.filter((m) => m.id !== metricId)
    updateCategory(categoryId, { metrics: updatedMetrics })

    toast({
      title: "Metric deleted",
      description: "The metric has been deleted.",
    })
  }

  // Handle subcategory deletion
  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    removeSubcategory(categoryId, subcategoryId)
    setShowDeleteSubcategoryConfirm(null)

    toast({
      title: "Subcategory deleted",
      description: "The subcategory has been deleted.",
    })
  }

  // Handle category deletion
  const handleDeleteCategory = (categoryId: string) => {
    removeCategory(categoryId)
    setShowDeleteConfirm(null)

    toast({
      title: "Category deleted",
      description: "The category has been deleted.",
    })
  }

  // Handle drag end event
  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return
    }

    // Reorder the categories
    reorderCategories(result.source.index, result.destination.index)

    toast({
      title: "Categories reordered",
      description: "The order of your categories has been updated.",
    })
  }

  // Toggle accordion item
  const toggleAccordionItem = (itemId: string) => {
    setExpandedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Toggle subcategory accordion item
  const toggleSubcategoryItem = (itemId: string) => {
    setExpandedSubcategories((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <>
      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 w-full sm:w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SortDesc className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("createdAt")}>Date Created</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("lastUpdated")}>Last Updated</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        <TabsContent value="categories" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Wellness Categories</CardTitle>
              <CardDescription>Manage your wellness tracking categories</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedCategories.length > 0 ? (
                <div className="mb-2 text-sm text-muted-foreground">
                  <p>Drag and drop categories to reorder them. Your most important categories should be at the top.</p>
                </div>
              ) : null}

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="categories">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-2 ${snapshot.isDraggingOver ? "bg-muted/50 rounded-md p-2" : ""}`}
                    >
                      {sortedCategories.map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`rounded-md border ${
                                snapshot.isDragging ? "border-primary shadow-md" : "border-border"
                              }`}
                            >
                              <div className="flex items-center p-4">
                                <div
                                  {...provided.dragHandleProps}
                                  className="mr-2 cursor-grab active:cursor-grabbing"
                                  aria-label="Drag to reorder"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <div
                                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-${category.color}-600`}
                                >
                                  {getCategoryIcon(category.id, "h-5 w-5 text-white")}
                                </div>

                                <div className="flex-1">
                                  <h3 className="font-medium">{category.name}</h3>
                                  <p className="text-sm text-muted-foreground">{category.description}</p>
                                </div>

                                <div className="flex items-center gap-2 mr-4">
                                  <Badge variant="outline" className="mr-2">
                                    {category.metrics.length} metrics
                                  </Badge>
                                  <Badge variant="outline">{category.subcategories?.length || 0} subcategories</Badge>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleAccordionItem(category.id)}
                                    aria-expanded={expandedItems.includes(category.id)}
                                  >
                                    {expandedItems.includes(category.id) ? "Collapse" : "Expand"}
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => setShowDeleteConfirm(category.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded content - only shown when expanded */}
                              {expandedItems.includes(category.id) && (
                                <div className="border-t p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Metrics section */}
                                    <div>
                                      <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-medium">Metrics</h4>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddMetric(category.id)}
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add Metric
                                        </Button>
                                      </div>

                                      <div className="space-y-3">
                                        {category.metrics.length > 0 ? (
                                          category.metrics.map((metric) => (
                                            <div
                                              key={metric.id}
                                              className="rounded-md border p-3 flex items-center justify-between"
                                            >
                                              <div>
                                                <div className="font-medium">{metric.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                  {metric.description}
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  <Badge variant="outline">{metric.unit}</Badge>
                                                  <Badge variant="outline">
                                                    Range: {metric.min} - {metric.max}
                                                  </Badge>
                                                  <Badge variant="outline">Goal: {metric.defaultGoal}</Badge>
                                                  {metric.type && <Badge variant="outline">Type: {metric.type}</Badge>}
                                                </div>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleEditMetric(category.id, metric)}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="text-red-500 hover:text-red-700"
                                                  onClick={() => handleDeleteMetric(category.id, metric.id)}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-4 text-center text-muted-foreground">
                                            No metrics defined for this category
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Subcategories section */}
                                    <div>
                                      <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-medium">Subcategories</h4>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddSubcategory(category.id)}
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add Subcategory
                                        </Button>
                                      </div>

                                      <div className="space-y-3">
                                        {category.subcategories && category.subcategories.length > 0 ? (
                                          category.subcategories.map((subcategory) => (
                                            <div
                                              key={subcategory.id}
                                              className="rounded-md border p-3 flex items-center justify-between"
                                            >
                                              <div>
                                                <div className="font-medium">{subcategory.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                  {subcategory.description}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <div
                                                    className={`w-4 h-4 rounded-full bg-${subcategory.color}-500`}
                                                  ></div>
                                                  <span className="text-xs text-muted-foreground">
                                                    {subcategory.color}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => handleEditSubcategory(category.id, subcategory)}
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="text-red-500 hover:text-red-700"
                                                  onClick={() =>
                                                    setShowDeleteSubcategoryConfirm({
                                                      categoryId: category.id,
                                                      subcategoryId: subcategory.id,
                                                    })
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-4 text-center text-muted-foreground">
                                            No subcategories defined for this category
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metadata section */}
                                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                      <span>Created: {formatDate(category.createdAt)}</span>
                                      <span>Last Updated: {formatDate(category.lastUpdated)}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {sortedCategories.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No categories</h3>
                  <p className="mt-2 text-sm text-muted-foreground">You haven't created any wellness categories yet.</p>
                  <Button className="mt-4" onClick={handleAddCategory}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Category
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategories" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Subcategories</CardTitle>
              <CardDescription>Manage subcategories for more detailed tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedCategories.map((category) => (
                  <Card key={`subcategory-${category.id}`} className="overflow-hidden">
                    <CardHeader className={`bg-${category.color}-100 py-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-md bg-${category.color}-600`}
                          >
                            {getCategoryIcon(category.id, "h-5 w-5 text-white")}
                          </div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSubcategoryItem(category.id)}
                          aria-expanded={expandedSubcategories.includes(category.id)}
                        >
                          {expandedSubcategories.includes(category.id) ? "Collapse" : "Expand"}
                        </Button>
                      </div>
                    </CardHeader>

                    {expandedSubcategories.includes(category.id) && (
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-muted-foreground">
                            {category.subcategories?.length || 0} subcategories
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleAddSubcategory(category.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subcategory
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {category.subcategories && category.subcategories.length > 0 ? (
                            category.subcategories.map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="rounded-md border p-4 transition-all hover:shadow-md"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full bg-${subcategory.color}-500`}></div>
                                    <div>
                                      <h4 className="font-medium">{subcategory.name}</h4>
                                      <p className="text-sm text-muted-foreground">{subcategory.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditSubcategory(category.id, subcategory)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        setShowDeleteSubcategoryConfirm({
                                          categoryId: category.id,
                                          subcategoryId: subcategory.id,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Created: {formatDate(subcategory.createdAt)}</span>
                                    <span>Last Updated: {formatDate(subcategory.lastUpdated)}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              No subcategories defined for this category
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {sortedCategories.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Tag className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No categories available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Create categories first to add subcategories.</p>
                    <Button className="mt-4" onClick={handleAddCategory}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of your wellness category."
                : "Create a new category to track in your wellness dashboard."}
            </DialogDescription>
          </DialogHeader>

          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={categoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fitness" {...field} />
                      </FormControl>
                      <FormDescription>The display name for this category.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., fitness"
                          {...field}
                          disabled={!!editingCategory}
                          onChange={(e) => {
                            // Auto-generate ID from name if empty
                            if (!editingCategory) {
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/[^a-z0-9-]/g, ""),
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Unique identifier (lowercase, no spaces).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this category is used for..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={categoryForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(icon, "h-5 w-5")}
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={categoryForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {availableColors.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full bg-${color.value}-500`}></div>
                                <span>{color.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingCategory ? "Update" : "Create"} Category</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Metric Form Dialog */}
      <Dialog open={!!showAddMetric} onOpenChange={(open) => !open && setShowAddMetric("")}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingMetric ? "Edit Metric" : "Add New Metric"}</DialogTitle>
            <DialogDescription>
              {editingMetric
                ? "Update the details of your wellness metric."
                : "Create a new metric to track in this category."}
            </DialogDescription>
          </DialogHeader>

          <Form {...metricForm}>
            <form onSubmit={metricForm.handleSubmit(onMetricSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={metricForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Daily Steps" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., daily-steps"
                          {...field}
                          disabled={!!editingMetric}
                          onChange={(e) => {
                            // Auto-generate ID from name if empty
                            if (!editingMetric) {
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/[^a-z0-9-]/g, ""),
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Unique identifier (lowercase, no spaces).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={metricForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this metric measures..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={metricForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableMetricTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>The type of data this metric tracks</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={metricForm.control}
                  name="min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricForm.control}
                  name="max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricForm.control}
                  name="step"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Increment amount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={metricForm.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Starting value for new entries</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metricForm.control}
                  name="defaultGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Goal</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Default target value</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddMetric("")}>
                  Cancel
                </Button>
                <Button type="submit">{editingMetric ? "Update" : "Add"} Metric</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Subcategory Form Dialog */}
      <Dialog open={!!showAddSubcategory} onOpenChange={(open) => !open && setShowAddSubcategory(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}</DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? "Update the details of your subcategory."
                : "Create a new subcategory for more detailed tracking."}
            </DialogDescription>
          </DialogHeader>

          <Form {...subcategoryForm}>
            <form onSubmit={subcategoryForm.handleSubmit(onSubcategorySubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={subcategoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cardio Exercise" {...field} />
                      </FormControl>
                      <FormDescription>The display name for this subcategory.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subcategoryForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., cardio-exercise"
                          {...field}
                          disabled={!!editingSubcategory}
                          onChange={(e) => {
                            // Auto-generate ID from name if empty
                            if (!editingSubcategory) {
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")
                                  .replace(/[^a-z0-9-]/g, ""),
                              )
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>Unique identifier (lowercase, no spaces).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={subcategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this subcategory is used for..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subcategoryForm.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {availableColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full bg-${color.value}-500`}></div>
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose a color to visually identify this subcategory.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddSubcategory(null)}>
                  Cancel
                </Button>
                <Button type="submit">{editingSubcategory ? "Update" : "Create"} Subcategory</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => !open && setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This will remove all metrics and subcategories associated
              with it and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && handleDeleteCategory(showDeleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <Dialog
        open={!!showDeleteSubcategoryConfirm}
        onOpenChange={(open) => !open && setShowDeleteSubcategoryConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subcategory Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subcategory? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSubcategoryConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteSubcategoryConfirm &&
                handleDeleteSubcategory(
                  showDeleteSubcategoryConfirm.categoryId,
                  showDeleteSubcategoryConfirm.subcategoryId,
                )
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
