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

interface Work {
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

interface AdminWorksManagementProps {
  isLoading: boolean
  onRefresh: () => void
}

export const AdminWorksManagement = ({ isLoading, onRefresh }: AdminWorksManagementProps) => {
  const [works, setWorks] = useState<Work[]>([])
  const [editingWork, setEditingWork] = useState<Work | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [galleryFiles, setGalleryFiles] = useState<Array<{ base64: string, name: string }>>([])

  useEffect(() => {
    loadWorks()
  }, [])

  const loadWorks = async () => {
    const token = localStorage.getItem('authToken')
    
    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28?action=content&type=works', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWorks(data.items || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки работ:', error)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const totalImages = galleryPreviews.length + files.length
    if (totalImages > 10) {
      alert('Максимум 10 фотографий')
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setGalleryPreviews(prev => [...prev, base64])
        setGalleryFiles(prev => [...prev, { base64, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const data: any = {
      type: 'works',
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price') as string) || null,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'true',
    }

    if (editingWork) {
      data.id = editingWork.id
      data.gallery_urls = editingWork.gallery_urls || []
    } else {
      data.gallery_urls = []
    }

    if (galleryFiles.length > 0) {
      const token = localStorage.getItem('authToken')
      const uploadedUrls: string[] = []

      for (const file of galleryFiles) {
        try {
          const uploadRes = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: 'create_content',
              type: 'works',
              title: 'temp',
              image_base64: file.base64,
              image_name: file.name,
            }),
          })

          if (uploadRes.ok) {
            const result = await uploadRes.json()
            if (result.image_url) {
              uploadedUrls.push(result.image_url)
            }
          }
        } catch (error) {
          console.error('Ошибка загрузки фото:', error)
        }
      }

      data.gallery_urls = [...(editingWork?.gallery_urls || []), ...uploadedUrls].slice(0, 10)
      data.image_url = data.gallery_urls[0]
    }

    const token = localStorage.getItem('authToken')
    const action = editingWork ? 'update_content' : 'create_content'

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
        setEditingWork(null)
        setGalleryPreviews([])
        setGalleryFiles([])
        loadWorks()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить работу?')) return

    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/e06691eb-ff8f-4b28-88e2-e9e033b0dd28', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'delete_content', type: 'works', id }),
      })

      if (response.ok) {
        loadWorks()
        onRefresh()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  const openEditDialog = (work?: Work) => {
    if (work) {
      setEditingWork(work)
      setGalleryPreviews(work.gallery_urls || [])
    } else {
      setEditingWork(null)
      setGalleryPreviews([])
    }
    setGalleryFiles([])
    setIsDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление портфолио</CardTitle>
              <CardDescription>
                Выполненные работы для демонстрации клиентам
              </CardDescription>
            </div>
            <Button onClick={() => openEditDialog()}>
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              Добавить работу
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader" className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Briefcase" className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Нет работ в портфолио</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {works.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  {work.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                      <img
                        src={work.image_url}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                      {work.gallery_urls && work.gallery_urls.length > 1 && (
                        <Badge className="absolute bottom-2 right-2 bg-black/60">
                          <Icon name="Images" className="mr-1 h-3 w-3" />
                          {work.gallery_urls.length}
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className={`text-base ${!work.is_active ? 'line-through opacity-50' : ''}`}>
                        {work.title}
                      </CardTitle>
                      {!work.is_active && (
                        <Badge variant="secondary">Скрыта</Badge>
                      )}
                    </div>
                    {work.category && (
                      <Badge variant="outline" className="w-fit">
                        {work.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    {work.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {work.description}
                      </p>
                    )}
                    {work.price && (
                      <p className="text-lg font-semibold mb-3">
                        {work.price.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(work)}
                      >
                        <Icon name="Edit" className="mr-2 h-4 w-4" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(work.id)}
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
              {editingWork ? 'Редактировать работу' : 'Добавить работу'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingWork?.title}
                required
                placeholder="Например: BMW X5 - Полная русификация"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingWork?.description}
                rows={3}
                placeholder="Подробное описание работы"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingWork?.category}
                  placeholder="SUV, Седан"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingWork?.price}
                  required
                  placeholder="15000"
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
                  defaultValue={editingWork?.display_order || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Статус</Label>
                <Select name="is_active" defaultValue={editingWork?.is_active !== false ? 'true' : 'false'}>
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
              <Label htmlFor="gallery">Фотографии (до 10 шт)</Label>
              <Input
                id="gallery"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
              />
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-1 left-1 bg-black/60 text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Загружено: {galleryPreviews.length} / 10
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {editingWork ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
