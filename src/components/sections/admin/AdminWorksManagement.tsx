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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<{ base64: string, name: string } | null>(null)

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
      data.image_url = editingWork.image_url
    }

    if (imageFile) {
      data.image_base64 = imageFile.base64
      data.image_name = imageFile.name
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
        setImagePreview('')
        setImageFile(null)
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
      setImagePreview(work.image_url || '')
    } else {
      setEditingWork(null)
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
              <CardTitle>Управление работами</CardTitle>
              <CardDescription>
                Портфолио выполненных работ и услуг
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
              <p className="text-muted-foreground">Нет работ</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {works.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  {work.image_url && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={work.image_url}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{work.title}</CardTitle>
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
                placeholder="Например: Русификация BMW X5"
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
                  defaultValue={editingWork?.price}
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
                {editingWork ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
