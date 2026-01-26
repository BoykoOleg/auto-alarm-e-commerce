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

interface Service {
  id: number
  title: string
  description: string
  category: string
  image_url: string
  price: number
  is_active: boolean
  display_order: number
}

interface AdminServicesManagementProps {
  isLoading: boolean
  onRefresh: () => void
}

export const AdminServicesManagement = ({ isLoading, onRefresh }: AdminServicesManagementProps) => {
  const [services, setServices] = useState<Service[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<{ base64: string, name: string } | null>(null)

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const token = localStorage.getItem('authToken')
    
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=services', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.items || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
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
      type: 'services',
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') as string) || null,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    }

    if (editingService) {
      data.id = editingService.id
      data.image_url = editingService.image_url
    }

    if (imageFile) {
      data.image_base64 = imageFile.base64
      data.image_name = imageFile.name
    }

    const token = localStorage.getItem('authToken')
    const action = editingService ? 'update_content' : 'create_content'

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
        setEditingService(null)
        setImagePreview('')
        setImageFile(null)
        loadServices()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить услугу?')) return

    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete_content', type: 'services', id }),
      })

      if (response.ok) {
        loadServices()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  const openEditDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setImagePreview(service.image_url || '')
    } else {
      setEditingService(null)
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
              <CardTitle>Управление услугами</CardTitle>
              <CardDescription>
                Каталог предоставляемых услуг
              </CardDescription>
            </div>
            <Button onClick={() => openEditDialog()}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить услугу
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Wrench" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет услуг</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  {service.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className={`text-base ${!service.is_active ? 'line-through opacity-50' : ''}`}>
                        {service.title}
                      </CardTitle>
                      {!service.is_active && (
                        <Badge variant="secondary">Скрыта</Badge>
                      )}
                    </div>
                    {service.category && (
                      <Badge variant="outline" className="w-fit">
                        {service.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    {service.price && (
                      <p className="text-lg font-semibold mb-3">
                        от {service.price.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(service)}
                      >
                        <Icon name="Edit" className="mr-2 h-4 w-4" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
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
              {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingService?.title}
                required
                placeholder="Например: Русификация мультимедиа"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingService?.description}
                rows={3}
                placeholder="Подробное описание услуги"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingService?.category}
                  placeholder="Мультимедиа"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingService?.price}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Порядок отображения</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={editingService?.display_order || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Статус</Label>
                <Select name="is_active" defaultValue={editingService?.is_active !== false ? 'true' : 'false'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Активна</SelectItem>
                    <SelectItem value="false">Скрыта</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <div className="mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
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
                {editingService ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}