import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Icon from '@/components/ui/icon'

interface HomeSectionProps {
  setActiveSection: (section: string) => void
}

export const HomeSection = ({ setActiveSection }: HomeSectionProps) => {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              🌐 Профессиональная русификация автомобилей
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Русификация магнитол и бортовых систем
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Превратим интерфейс вашего автомобиля на русский язык. Работаем с любыми марками. 
              Быстро, качественно, с гарантией.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-base font-semibold"
                onClick={() => setActiveSection('russification')}
              >
                <Icon name="Languages" className="mr-2 h-5 w-5" />
                Узнать подробнее
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base font-semibold"
                onClick={() => setActiveSection('contacts')}
              >
                <Icon name="Phone" className="mr-2 h-5 w-5" />
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2" />
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Русификация автомобилей</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Полная адаптация интерфейса вашего автомобиля под русский язык
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon name="Languages" className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Что мы русифицируем?</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="h-5 w-5 text-primary mt-0.5" />
                    <span>Мультимедийные системы и магнитолы</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="h-5 w-5 text-primary mt-0.5" />
                    <span>Бортовые компьютеры и приборные панели</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="h-5 w-5 text-primary mt-0.5" />
                    <span>Навигационные системы</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="h-5 w-5 text-primary mt-0.5" />
                    <span>Системы климат-контроля</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Check" className="h-5 w-5 text-primary mt-0.5" />
                    <span>Меню настроек автомобиля</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon name="Star" className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Наши преимущества</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Icon name="Zap" className="h-5 w-5 text-primary mt-0.5" />
                    <span><strong>Быстро:</strong> работа занимает от 1 до 3 часов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Shield" className="h-5 w-5 text-primary mt-0.5" />
                    <span><strong>Безопасно:</strong> сохраняем заводскую гарантию</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Award" className="h-5 w-5 text-primary mt-0.5" />
                    <span><strong>Качественно:</strong> официальные прошивки и шрифты</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Users" className="h-5 w-5 text-primary mt-0.5" />
                    <span><strong>Опыт:</strong> работаем с 2015 года, более 5000 автомобилей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="Sparkles" className="h-5 w-5 text-primary mt-0.5" />
                    <span><strong>Гарантия:</strong> 1 год на все виды работ</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl font-bold mb-3">Почему русификация важна?</h3>
              <p className="text-muted-foreground">
                Комфорт и безопасность управления автомобилем начинаются с понятного интерфейса
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon name="Eye" className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Понятно с первого взгляда</h4>
                <p className="text-sm text-muted-foreground">
                  Не нужно угадывать значение иконок и англоязычных меню
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon name="Car" className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Безопасность вождения</h4>
                <p className="text-sm text-muted-foreground">
                  Меньше отвлекаетесь от дороги, быстрее находите нужные функции
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon name="TrendingUp" className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Полный функционал</h4>
                <p className="text-sm text-muted-foreground">
                  Получите доступ ко всем скрытым функциям и настройкам
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4">🚗 Наши работы</Badge>
            <h2 className="font-heading text-3xl font-bold mb-4">Примеры русификации</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Реальные результаты работы с популярными моделями автомобилей
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="https://cdn.poehali.dev/projects/c4b0cb42-73ec-4bbe-92b0-d10bcd013982/files/9071c9f3-4636-4500-af99-f9377ccb5048.jpg"
                  alt="Русификация Toyota RAV4"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2 bg-primary">Toyota RAV4</Badge>
                  <p className="text-white font-semibold text-sm">Полная русификация мультимедиа</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="https://cdn.poehali.dev/projects/c4b0cb42-73ec-4bbe-92b0-d10bcd013982/files/dc7f5db4-e9da-49a0-a7ea-709748a86cae.jpg"
                  alt="Русификация Toyota Highlander"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2 bg-primary">Toyota Highlander</Badge>
                  <p className="text-white font-semibold text-sm">Премиум система на русском</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="https://cdn.poehali.dev/projects/c4b0cb42-73ec-4bbe-92b0-d10bcd013982/files/49027616-6207-4788-8b3c-d02ed3e5c9ae.jpg"
                  alt="Русификация Toyota Camry 80"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2 bg-primary">Toyota Camry 80</Badge>
                  <p className="text-white font-semibold text-sm">Цифровая панель + навигация</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src="https://cdn.poehali.dev/projects/c4b0cb42-73ec-4bbe-92b0-d10bcd013982/files/54094f4e-a994-49c4-8aa8-33903fc3fd05.jpg"
                  alt="Русификация Li Auto"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2 bg-primary">Li Auto L9</Badge>
                  <p className="text-white font-semibold text-sm">Китайские модели - русский язык</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setActiveSection('russification')}
            >
              <Icon name="Images" className="mr-2 h-5 w-5" />
              Посмотреть все работы
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}