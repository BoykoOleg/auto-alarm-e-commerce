import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Icon from '@/components/ui/icon'

interface DashboardRequestFormProps {
  userData: any
  onSubmitSuccess: () => void
}

export const DashboardRequestForm = ({ userData, onSubmitSuccess }: DashboardRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [selectedServiceType, setSelectedServiceType] = useState('multimedia')

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const formElement = e.target as HTMLFormElement
    const formData = {
      client_name: (formElement.elements.namedItem('client-name') as HTMLInputElement).value,
      client_phone: (formElement.elements.namedItem('client-phone') as HTMLInputElement).value,
      client_email: (formElement.elements.namedItem('client-email') as HTMLInputElement).value,
      car_brand: (formElement.elements.namedItem('car-brand') as HTMLInputElement).value,
      car_model: (formElement.elements.namedItem('car-model') as HTMLInputElement).value,
      car_year: parseInt((formElement.elements.namedItem('car-year') as HTMLInputElement).value),
      service_type: selectedServiceType,
      description: (formElement.elements.namedItem('description') as HTMLTextAreaElement).value,
    }

    const token = localStorage.getItem('authToken')

    try {
      const response = await fetch('https://functions.poehali.dev/08452dc9-363d-4b0e-b976-d796d2cc8717', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSubmitStatus('success')
        formElement.reset()
        setSelectedServiceType('multimedia')
        onSubmitSuccess()
        
        await fetch('https://functions.poehali.dev/3ecd03ac-7f19-45a4-b1aa-563f140ea3c9', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userData?.name || 'Партнёр',
            phone: formData.client_phone,
            car: `${formData.car_brand} ${formData.car_model} ${formData.car_year}`,
            message: `Тип услуги: ${formData.service_type}. ${formData.description || 'Без комментария'}`,
            type: 'Заявка от партнёра',
          }),
        }).catch(err => console.error('Ошибка отправки в Telegram:', err))
      } else {
        console.error('Ошибка создания заявки:', result)
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новую заявку</CardTitle>
        <CardDescription>
          Заполните форму для создания заявки на русификацию
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">ФИО клиента *</Label>
              <Input
                id="client-name"
                name="client-name"
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">Телефон клиента *</Label>
              <Input
                id="client-phone"
                name="client-phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-email">Email клиента</Label>
            <Input
              id="client-email"
              name="client-email"
              type="email"
              placeholder="client@example.com"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-brand">Марка *</Label>
              <Input
                id="car-brand"
                name="car-brand"
                placeholder="BMW"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car-model">Модель *</Label>
              <Input
                id="car-model"
                name="car-model"
                placeholder="X5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car-year">Год *</Label>
              <Input
                id="car-year"
                name="car-year"
                type="number"
                min="1990"
                max="2030"
                placeholder="2020"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-type">Тип услуги *</Label>
            <Select
              value={selectedServiceType}
              onValueChange={setSelectedServiceType}
            >
              <SelectTrigger id="service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multimedia">Мультимедиа</SelectItem>
                <SelectItem value="dashboard">Бортовой компьютер</SelectItem>
                <SelectItem value="navigation">Навигация</SelectItem>
                <SelectItem value="climate">Климат-контроль</SelectItem>
                <SelectItem value="full">Полная русификация</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Комментарий</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Дополнительная информация о заявке"
              rows={3}
            />
          </div>

          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <Icon name="CheckCircle" className="h-5 w-5" />
              <span>Заявка успешно создана!</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <Icon name="AlertCircle" className="h-5 w-5" />
              <span>Ошибка при создании заявки. Попробуйте снова.</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon name="Loader" className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" className="mr-2 h-4 w-4" />
                Создать заявку
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
