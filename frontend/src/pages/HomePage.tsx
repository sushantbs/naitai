import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Github, Zap, Shield, Globe, Target } from 'lucide-react'
import { ApiTest } from '@/components/ApiTest'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Built with Vite and optimized for performance',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Type Safe',
      description: 'End-to-end type safety with TypeScript',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Modern Stack',
      description: 'React, Tailwind, shadcn/ui, and Framer Motion',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1
            className="text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Naitai
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <Badge variant="secondary" className="mb-4">
                🚀 Full-Stack Monorepo
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Modern Full-Stack
                <br />
                Application
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A production-ready monorepo with React, TypeScript, Node.js, and
                Supabase. Built with modern tools and best practices.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-center gap-4 mb-12"
            >
              <Button size="lg" className="group" asChild>
                <Link to="/habits">
                  <Target className="mr-2 h-4 w-4" />
                  Start Tracking Habits
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* API Test Section */}
            <motion.div variants={itemVariants}>
              <ApiTest />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Built with ❤️ using React, TypeScript, and Supabase</p>
        </div>
      </footer>
    </div>
  )
}
