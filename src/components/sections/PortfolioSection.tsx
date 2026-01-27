import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Icon from '@/components/ui/icon'

interface PortfolioWork {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  gallery_urls?: string[]
  price: number
  is_active: boolean
  display_order: number
}

export const PortfolioSection = () => {
  const [works, setWorks] = useState<PortfolioWork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    loadWorks()
  }, [])

  const loadWorks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=works')
      
      if (response.ok) {
        const data = await response.json()
        const activeWorks = (data.items || []).filter((w: PortfolioWork) => w.is_active)
        setWorks(activeWorks)
      }
    } catch (error) {
      console.error('Ошибка загрузки работ:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openWorkModal = (work: PortfolioWork) => {
    setSelectedWork(work)
    setCurrentImageIndex(0)
    setIsDialogOpen(true)
  }

  const nextImage = () => {
    if (!selectedWork?.gallery_urls) return
    setCurrentImageIndex((prev) => 
      prev < selectedWork.gallery_urls!.length - 1 ? prev + 1 : 0
    )
  }

  const prevImage = () => {
    if (!selectedWork?.gallery_urls) return
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : selectedWork.gallery_urls!.length - 1
    )
  }

  const categories = ['all', ...Array.from(new Set(works.map(w => w.category).filter(Boolean)))]
  const filteredWorks = selectedCategory === 'all' 
    ? works 
    : works.filter(w => w.category === selectedCategory)

  const currentGallery = selectedWork?.gallery_urls || []

  return (
    <>
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Наши работы
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Примеры выполненных проектов по русификации автомобилей
            </p>
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Все работы' : category}
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-16">
              <Icon name="Loader" className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Загрузка работ...</p>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="Briefcase" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {selectedCategory === 'all' ? 'Работы скоро появятся' : 'Нет работ в этой категории'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorks.map((work) => (
                <Card 
                  key={work.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openWorkModal(work)}
                >
                  {work.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                      <img
                        src={work.image_url}
                        alt={work.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {work.gallery_urls && work.gallery_urls.length > 1 && (
                        <Badge className="absolute bottom-2 right-2 bg-black/70">
                          <Icon name="Images" className="mr-1 h-3 w-3" />
                          {work.gallery_urls.length}
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl">{work.title}</CardTitle>
                    </div>
                    {work.category && (
                      <Badge variant="outline" className="w-fit">
                        {work.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {work.description && (
                      <CardDescription className="mb-4 line-clamp-2">
                        {work.description}
                      </CardDescription>
                    )}
                    {work.price && (
                      <div className="flex items-center gap-2 text-primary">
                        <Icon name="DollarSign" className="h-5 w-5" />
                        <span className="text-xl font-semibold">
                          {work.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedWork?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedWork && (
            <div className="space-y-6">
              {currentGallery.length > 0 && (
                <div className="relative">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img
                      src={currentGallery[currentImageIndex]}
                      alt={`${selectedWork.title} - фото ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {currentGallery.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/80"
                        onClick={prevImage}
                      >
                        <Icon name="ChevronLeft" className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 hover:bg-black/80"
                        onClick={nextImage}
                      >
                        <Icon name="ChevronRight" className="h-6 w-6" />
                      </Button>
                      <Badge className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70">
                        {currentImageIndex + 1} / {currentGallery.length}
                      </Badge>
                    </>
                  )}
                </div>
              )}

              {currentGallery.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {currentGallery.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {selectedWork.category && (
                  <Badge variant="outline" className="text-sm">
                    {selectedWork.category}
                  </Badge>
                )}

                {selectedWork.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Описание работы</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedWork.description}
                    </p>
                  </div>
                )}

                {selectedWork.price && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Icon name="DollarSign" className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {selectedWork.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
