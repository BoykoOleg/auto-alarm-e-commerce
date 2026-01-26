import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface AdminProductsManagementProps {
  isLoading: boolean
  onRefresh: () => void
}

export const AdminProductsManagement = ({ isLoading, onRefresh }: AdminProductsManagementProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<{ base64: string, name: string } | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const token = localStorage.getItem('authToken')
    
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.items || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setImagePreview(base64)
      setImageFile({ base64, name: file.name })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data: any = {
      type: 'products',
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') as string),
      stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    }

    if (editingProduct) {
      data.id = editingProduct.id
      data.image_url = editingProduct.image_url
    }

    if (imageFile) {
      data.image_base64 = imageFile.base64
      data.image_name = imageFile.name
    }

    const token = localStorage.getItem('authToken')
    const action = editingProduct ? 'update_content' : 'create_content'

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...data }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingProduct(null)
        setImagePreview('')
        setImageFile(null)
        loadProducts()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return

    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete_content', type: 'products', id }),
      })

      if (response.ok) {
        loadProducts()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  const openEditDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setImagePreview(product.image_url || '')
    } else {
      setEditingProduct(null)
      setImagePreview('')
    }
    setImageFile(null)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление товарами</CardTitle>
              <CardDescription>
                Каталог товаров и запчастей для продажи
              </CardDescription>
            </div>
            <Button onClick={() => openEditDialog()}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить товар
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Package" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет товаров</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  {product.image_url && (
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{product.title}</CardTitle>
                      <div className="flex flex-col gap-1">
                        {!product.is_active && (
                          <Badge variant="secondary">Скрыт</Badge>
                        )}
                        {product.stock_quantity === 0 && (
                          <Badge variant="destructive">Нет в наличии</Badge>
                        )}
                      </div>
                    </div>
                    {product.category && (
                      <Badge variant="outline" className="w-fit">
                        {product.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-semibold">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                      <Badge variant="outline">
                        <Icon name="Package" className="mr-1 h-3 w-3" />
                        {product.stock_quantity} шт
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(product)}
                      >
                        <Icon name="Edit" className="mr-2 h-4 w-4" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Icon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingProduct?.title}
                required
                placeholder="Например: Блок русификации CCC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingProduct?.description}
                rows={3}
                placeholder="Подробное описание товара"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingProduct?.category}
                  placeholder="Электроника"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct?.price}
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Количество на складе</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  defaultValue={editingProduct?.stock_quantity || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Порядок отображения</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={editingProduct?.display_order || 0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Статус</Label>
              <Select name="is_active" defaultValue={editingProduct?.is_active !== false ? 'true' : 'false'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Активен</SelectItem>
                  <SelectItem value="false">Скрыт</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Изображение</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2 aspect-square w-full max-w-xs overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {editingProduct ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
