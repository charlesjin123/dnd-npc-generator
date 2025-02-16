"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateNPC, generateNPCImage, askFollowUpQuestion } from "../api/npcApi"
import { motion } from "framer-motion"
import { Scroll, Sword } from "lucide-react"
import { set } from "date-fns"
import ClipLoader from 'react-spinners/ClipLoader';

export interface NPCData {
  name: string
  race: string
  class: string
  description: string
}

export default function NPCGenerator() {
  const [description, setDescription] = useState("")
  const [npcData, setNpcData] = useState<NPCData | null>(null)
  const [npcImageUrl, setNpcImageUrl] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState("")
  const [followUpAnswer, setFollowUpAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setIsImageLoading(true)
    try {
      const generatedNPC = await generateNPC(description)
      setIsLoading(false)
      setNpcData(generatedNPC)
      const generatedImage = await generateNPCImage(generatedNPC)
      setIsImageLoading(false)
      setNpcImageUrl(generatedImage)
    } catch (error) {
      console.error("Error generating NPC:", error)
    }
    
  }

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const answer = await askFollowUpQuestion(followUpQuestion, npcData)
      setFollowUpAnswer(answer)
    } catch (error) {
      console.error("Error asking follow-up question:", error)
    }
    setIsLoading(false)
  }

  const handleReset = () => {
    setDescription("")
    setNpcData(null)
    setFollowUpQuestion("")
    setFollowUpAnswer("")
  }

  return (
    <div className="min-h-screen bg-[url('/parchment-bg.jpg')] bg-cover bg-center py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4 font-medieval">CJ's D&D NPC Generator</h1>
          <p className="text-xl text-muted-foreground">Create unique characters for your adventures</p>
        </header>

        <Card className="mb-8 shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl">
              <Scroll className="mr-2" />
              Create Your NPC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a basic description of the NPC..."
                className="min-h-[100px] bg-background/50 border-primary/30"
                rows={4}
              />
              <Button
                type="submit"
                disabled={isLoading || !description}
                className="w-full transition-all duration-300 hover:scale-105"
              >
                {isLoading ? "Summoning NPC..." : "Generate NPC"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {npcData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mb-8 shadow-lg border-2 border-primary/20 bg-background/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  <Sword className="mr-2" />
                  Character Sheet
                </CardTitle>
              </CardHeader>
              <CardContent>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-lg">
                    <strong>Name:</strong> {npcData.name}
                  </div>
                  <div className="text-lg">
                    <strong>Race:</strong> {npcData.race}
                  </div>
                  <div className="text-lg">
                    <strong>Class/Job:</strong> {npcData.class}
                  </div>
                </div>
                <div className="mt-4">
                  <strong className="text-lg">Description:</strong>
                  <p className="mt-2 text-muted-foreground">{npcData.description}</p>
                </div>
                <div className="mt-4">
                  <strong className="text-lg">Image:</strong>
                  <div className="flex justify-center items-center mt-2">
                    {isImageLoading ? (
                      <ClipLoader size={50} color={"#123abc"} loading={isImageLoading} />
                    ) : (
                      npcImageUrl && <img src={npcImageUrl} alt="Generated NPC" className="w-96 h-96 rounded-lg shadow-md" />
                    )}
                  </div>
              </div>
              </CardContent>
            </Card>

            <Card className="mb-8 shadow-lg border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  <Scroll className="mr-2" />
                  Ask a Follow-up Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFollowUp} className="space-y-4">
                  <Input
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder="Ask a follow-up question about the NPC..."
                    className="bg-background/50 border-primary/30"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !followUpQuestion}
                    className="w-full transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? "Consulting the Oracle..." : "Ask Question"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {followUpAnswer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mb-8 shadow-lg border-2 border-primary/20 bg-background/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  <Scroll className="mr-2" />
                  Follow-up Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{followUpAnswer}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="text-center">
          <Button onClick={handleReset} variant="outline" className="transition-all duration-300 hover:scale-105">
            Reset Character
          </Button>
        </div>
      </div>
    </div>
  )
}

