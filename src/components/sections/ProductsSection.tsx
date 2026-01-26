import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface Product {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  price: number
  stock_quantity: number
  is_active: boolean
  display_order: number
}

export const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=products')
      
      if (response.ok) {
        const data = await response.json()
        const activeProducts = (data.items || []).filter((p: Product) => p.is_active)
        setProducts(activeProducts)
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const handleContact = () => {
    const element = document.getElementById('contact')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Каталог товаров
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Оборудование и запчасти для русификации автомобилей
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
                {category === 'all' ? 'Все товары' : category}
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <Icon name="Loader" className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка товаров...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Package" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {selectedCategory === 'all' ? 'Товары скоро появятся' : 'Нет товаров в этой категории'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {product.image_url && (
                  <div className="aspect-square w-full overflow-hidden bg-background">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="flex-grow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="w-fit">
                      {product.category}
                    </Badge>
                  )}
                  {product.description && (
                    <CardDescription className="line-clamp-3 mt-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                    {product.stock_quantity > 0 ? (
                      <Badge variant="outline" className="text-xs">
                        <Icon name="Check" className="mr-1 h-3 w-3" />
                        В наличии
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Под заказ
                      </Badge>
                    )}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleContact}
                  >
                    <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                    Заказать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
