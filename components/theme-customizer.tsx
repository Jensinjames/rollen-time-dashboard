"use client"

import { useState } from "react"
import { useColorTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Paintbrush, Trash, Save, Undo2, ChevronDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ThemeCustomizer() {
  const { toast } = useToast()
  const {
    currentTheme,
    updateThemeColor,
    updateCategoryColor,
    resetTheme,
    saveTheme,
    savedThemes,
    loadTheme,
    deleteTheme,
  } = useColorTheme()

  const [activeTab, setActiveTab] = useState("general")
  const [isOpen, setIsOpen] = useState(false)
  const [themeName, setThemeName] = useState("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      toast({
        title: "Theme name required",
        description: "Please enter a name for your theme",
        variant: "destructive",
      })
      return
    }

    saveTheme(themeName)
    setThemeName("")
    setIsSaveDialogOpen(false)

    toast({
      title: "Theme saved",
      description: `Your theme "${themeName}" has been saved`,
    })
  }

  const handleLoadTheme = (name: string) => {
    loadTheme(name)
    toast({
      title: "Theme loaded",
      description: `Theme "${name}" has been applied`,
    })
  }

  const handleDeleteTheme = (name: string) => {
    deleteTheme(name)
    toast({
      title: "Theme deleted",
      description: `Theme "${name}" has been deleted`,
    })
  }

  const handleResetTheme = () => {
    resetTheme()
    toast({
      title: "Theme reset",
      description: "Theme has been reset to default",
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full" aria-label="Customize theme">
            <Paintbrush className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Customize Theme</DialogTitle>
            <DialogDescription>Personalize your dashboard with custom colors and themes.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center my-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleResetTheme}>
                <Undo2 className="h-4 w-4 mr-1" /> Reset
              </Button>

              <Button variant="outline" size="sm" onClick={() => setIsSaveDialogOpen(true)}>
                <Save className="h-4 w-4 mr-1" /> Save Theme
              </Button>
            </div>

            {savedThemes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Load Theme <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Saved Themes</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedThemes.map((theme) => (
                    <DropdownMenuItem key={theme.name} className="flex justify-between">
                      <span onClick={() => handleLoadTheme(theme.name)} className="flex-1 cursor-pointer">
                        {theme.name}
                      </span>
                      <Trash
                        className="h-4 w-4 text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTheme(theme.name)
                        }}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Primary"
                    color={currentTheme.primary}
                    onChange={(color) => updateThemeColor("primary", color)}
                  />
                  <ColorPicker
                    label="Secondary"
                    color={currentTheme.secondary}
                    onChange={(color) => updateThemeColor("secondary", color)}
                  />
                  <ColorPicker
                    label="Accent"
                    color={currentTheme.accent}
                    onChange={(color) => updateThemeColor("accent", color)}
                  />
                  <ColorPicker
                    label="Background"
                    color={currentTheme.background}
                    onChange={(color) => updateThemeColor("background", color)}
                  />
                  <ColorPicker
                    label="Card"
                    color={currentTheme.card}
                    onChange={(color) => updateThemeColor("card", color)}
                  />
                  <ColorPicker
                    label="Muted"
                    color={currentTheme.muted}
                    onChange={(color) => updateThemeColor("muted", color)}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Preview</h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.background }}>
                    <div className="flex flex-col gap-2">
                      <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.card }}>
                        <h4 className="text-sm font-medium" style={{ color: currentTheme.primary }}>
                          Card Title
                        </h4>
                        <p className="text-xs" style={{ color: currentTheme.primary }}>
                          This is how your content will look with the selected theme.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="p-2 rounded-md text-xs"
                          style={{ backgroundColor: currentTheme.primary, color: "#ffffff" }}
                        >
                          Primary
                        </div>
                        <div
                          className="p-2 rounded-md text-xs"
                          style={{ backgroundColor: currentTheme.secondary, color: currentTheme.primary }}
                        >
                          Secondary
                        </div>
                        <div
                          className="p-2 rounded-md text-xs"
                          style={{ backgroundColor: currentTheme.accent, color: "#ffffff" }}
                        >
                          Accent
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Faith"
                    color={currentTheme.categoryColors.faith}
                    onChange={(color) => updateCategoryColor("faith", color)}
                  />
                  <ColorPicker
                    label="Work"
                    color={currentTheme.categoryColors.work}
                    onChange={(color) => updateCategoryColor("work", color)}
                  />
                  <ColorPicker
                    label="Life"
                    color={currentTheme.categoryColors.life}
                    onChange={(color) => updateCategoryColor("life", color)}
                  />
                  <ColorPicker
                    label="Health"
                    color={currentTheme.categoryColors.health}
                    onChange={(color) => updateCategoryColor("health", color)}
                  />
                  <ColorPicker
                    label="Mindfulness"
                    color={currentTheme.categoryColors.mindfulness}
                    onChange={(color) => updateCategoryColor("mindfulness", color)}
                  />
                  <ColorPicker
                    label="Learning"
                    color={currentTheme.categoryColors.learning}
                    onChange={(color) => updateCategoryColor("learning", color)}
                  />
                  <ColorPicker
                    label="Relationships"
                    color={currentTheme.categoryColors.relationships}
                    onChange={(color) => updateCategoryColor("relationships", color)}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Category Preview</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentTheme.categoryColors).map(([category, color]) => (
                      <div
                        key={category}
                        className="p-3 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: color, color: "#ffffff" }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white/20" />
                        <span className="capitalize">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Save Theme</DialogTitle>
            <DialogDescription>Give your theme a name to save it for later use.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="theme-name">Theme Name</Label>
            <Input
              id="theme-name"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="My Custom Theme"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTheme}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
