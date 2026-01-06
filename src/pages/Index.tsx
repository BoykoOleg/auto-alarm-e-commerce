import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Icon from '@/components/ui/icon'

const Index = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Все товары', icon: 'Grid3x3' },
    { id: 'signaling', name: 'Сигнализации', icon: 'Shield' },
    { id: 'autostart', name: 'Автозапуск', icon: 'Power' },
    { id: 'sensors', name: 'Датчики', icon: 'Activity' },
    { id: 'cameras', name: 'Камеры', icon: 'Camera' }
  ]

  const products = [
    {
      id: 1,
      name: 'StarLine A96 BT',
      category: 'signaling',
      price: '18 900 ₽',
      description: 'Автосигнализация с Bluetooth и автозапуском',
      features: ['Bluetooth', 'Автозапуск', 'GPS'],
      popular: true
    },
    {
      id: 2,
      name: 'Pandora DXL 5000 Pro',
      category: 'signaling',
      price: '24 500 ₽',
      description: 'Премиум сигнализация с мобильным приложением',
      features: ['GSM', 'GPS', 'CAN'],
      popular: true
    },
    {
      id: 3,
      name: 'Webasto Thermo Top',
      category: 'autostart',
      price: '32 000 ₽',
      description: 'Автономный подогреватель двигателя',
      features: ['Таймер', 'GSM', 'Дистанционный запуск']
    },
    {
      id: 4,
      name: 'Датчик удара',
      category: 'sensors',
      price: '2 900 ₽',
      description: 'Двухзонный датчик удара',
      features: ['Регулировка', '2 зоны', 'Светодиод']
    },
    {
      id: 5,
      name: 'Видеорегистратор 4K',
      category: 'cameras',
      price: '8 500 ₽',
      description: 'Видеорегистратор с GPS',
      features: ['4K', 'GPS', 'Wi-Fi'],
      popular: true
    },
    {
      id: 6,
      name: 'Парктроник 8 датчиков',
      category: 'sensors',
      price: '5 200 ₽',
      description: 'Парковочная система',
      features: ['8 датчиков', 'LCD дисплей', 'Звук']
    }
  ]

  const services = [
    {
      title: 'Установка сигнализаций',
      description: 'Профессиональная установка любых автосигнализаций с гарантией',
      price: 'от 3 000 ₽',
      icon: 'Settings'
    },
    {
      title: 'Диагностика систем',
      description: 'Полная диагностика электронных систем автомобиля',
      price: 'от 1 500 ₽',
      icon: 'Search'
    },
    {
      title: 'Ремонт и настройка',
      description: 'Ремонт и настройка сигнализаций, автозапуска',
      price: 'от 2 000 ₽',
      icon: 'Wrench'
    },
    {
      title: 'Консультация',
      description: 'Подбор оптимального решения для вашего автомобиля',
      price: 'Бесплатно',
      icon: 'MessageCircle'
    }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Icon name="Shield" className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">AutoSecure</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveSection('home')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'home' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Главная
            </button>
            <button
              onClick={() => setActiveSection('catalog')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'catalog' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Каталог
            </button>
            <button
              onClick={() => setActiveSection('russification')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'russification' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Русификация
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'services' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Услуги
            </button>
            <button
              onClick={() => setActiveSection('about')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'about' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              О компании
            </button>
            <button
              onClick={() => setActiveSection('contacts')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'contacts' ? 'text-primary' : 'text-foreground/60'
              }`}
            >
              Контакты
            </button>
          </nav>

          <Button className="hidden md:flex">
            <Icon name="Phone" className="mr-2 h-4 w-4" />
            8 (800) 555-35-35
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Icon name="Menu" className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main>
        {activeSection === 'home' && (
          <>
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
              <div className="container px-4">
                <div className="mx-auto max-w-3xl text-center animate-fade-in">
                  <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                    🚗 Защита вашего автомобиля
                  </Badge>
                  <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                    Современные системы безопасности для автомобилей
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Профессиональная установка сигнализаций, автозапуска и дополнительного оборудования. 
                    Гарантия качества и надежности.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="text-base font-semibold"
                      onClick={() => setActiveSection('catalog')}
                    >
                      <Icon name="ShoppingCart" className="mr-2 h-5 w-5" />
                      Смотреть каталог
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

            <section className="py-16 bg-background">
              <div className="container px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex justify-center mb-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon name="Shield" className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-1">500+</h3>
                    <p className="text-sm text-muted-foreground">Довольных клиентов</p>
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex justify-center mb-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon name="Award" className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-1">5 лет</h3>
                    <p className="text-sm text-muted-foreground">На рынке</p>
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex justify-center mb-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon name="Clock" className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-1">24/7</h3>
                    <p className="text-sm text-muted-foreground">Поддержка</p>
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex justify-center mb-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon name="Truck" className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-1">Бесплатно</h3>
                    <p className="text-sm text-muted-foreground">Доставка</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 bg-muted/30">
              <div className="container px-4">
                <div className="text-center mb-12">
                  <Badge className="mb-4">⭐ Популярные товары</Badge>
                  <h2 className="font-heading text-3xl font-bold mb-4">Хиты продаж</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Самые востребованные решения для защиты вашего автомобиля
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {products.filter(p => p.popular).map((product, idx) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-accent/10 text-accent">
                            Хит продаж
                          </Badge>
                        </div>
                        <CardTitle className="font-heading">{product.name}</CardTitle>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-2xl font-bold text-primary">{product.price}</p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full group-hover:bg-primary/90">
                          <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                          В корзину
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setActiveSection('catalog')}
                  >
                    Смотреть весь каталог
                    <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}

        {activeSection === 'catalog' && (
          <section className="py-20">
            <div className="container px-4">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl font-bold mb-4">Каталог товаров</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Широкий ассортимент сигнализаций и дополнительного оборудования
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="gap-2"
                  >
                    <Icon name={cat.icon} className="h-4 w-4" />
                    {cat.name}
                  </Button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      {product.popular && (
                        <Badge variant="secondary" className="bg-accent/10 text-accent mb-2 w-fit">
                          Хит продаж
                        </Badge>
                      )}
                      <CardTitle className="font-heading">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-2xl font-bold text-primary">{product.price}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button className="flex-1 group-hover:bg-primary/90">
                        <Icon name="ShoppingCart" className="mr-2 h-4 w-4" />
                        В корзину
                      </Button>
                      <Button variant="outline" size="icon">
                        <Icon name="Heart" className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'russification' && (
          <section className="py-20">
            <div className="container px-4">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <Badge className="mb-4">🌐 Русификация автомобилей</Badge>
                  <h2 className="font-heading text-3xl font-bold mb-4">Русификация автомобильных систем</h2>
                  <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                    Профессиональная русификация мультимедиа, бортовых компьютеров и других систем для вашего комфорта
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                  <Card className="animate-fade-in">
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                        <Icon name="Monitor" className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="font-heading text-2xl">Мультимедийные системы</CardTitle>
                      <CardDescription className="text-base">
                        Русификация меню, голосовых команд и интерфейса
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Перевод всех пунктов меню на русский язык</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Установка русских голосовых подсказок</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Русские карты навигации</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Настройка русской клавиатуры</span>
                        </li>
                      </ul>
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-lg font-bold text-primary mb-2">от 5 000 ₽</p>
                        <Button className="w-full">
                          Заказать русификацию
                          <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                        <Icon name="Gauge" className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="font-heading text-2xl">Бортовые компьютеры</CardTitle>
                      <CardDescription className="text-base">
                        Русификация приборной панели и информационных экранов
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Перевод сообщений на приборной панели</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Русификация меню настроек автомобиля</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Перевод предупреждений и уведомлений</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon name="CheckCircle" className="h-5 w-5 text-primary mt-0.5" />
                          <span>Настройка региональных параметров</span>
                        </li>
                      </ul>
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-lg font-bold text-primary mb-2">от 4 000 ₽</p>
                        <Button className="w-full">
                          Заказать русификацию
                          <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-12 bg-gradient-to-br from-primary/5 to-accent/5 animate-scale-in">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">Поддерживаемые марки автомобилей</CardTitle>
                    <CardDescription>
                      Работаем с большинством популярных марок и моделей
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Toyota', icon: 'Car' },
                        { name: 'Mercedes', icon: 'Car' },
                        { name: 'BMW', icon: 'Car' },
                        { name: 'Audi', icon: 'Car' },
                        { name: 'Volkswagen', icon: 'Car' },
                        { name: 'Hyundai', icon: 'Car' },
                        { name: 'Kia', icon: 'Car' },
                        { name: 'Mazda', icon: 'Car' }
                      ].map((brand) => (
                        <div key={brand.name} className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-primary/5 transition-colors">
                          <Icon name={brand.icon} className="h-6 w-6 text-primary" />
                          <span className="font-semibold">{brand.name}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-6 text-center">
                      Не нашли свою марку? Свяжитесь с нами для уточнения возможности русификации
                    </p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center animate-slide-up">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="Clock" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Быстро</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Русификация занимает от 1 до 3 часов в зависимости от модели
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="Shield" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Безопасно</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Сохраняем заводскую гарантию, используем официальные методы
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="Wrench" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Качественно</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Полный перевод всех функций без потери функциональности
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'services' && (
          <section className="py-20">
            <div className="container px-4">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl font-bold mb-4">Наши услуги</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Профессиональная установка и обслуживание автомобильного оборудования
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
                {services.map((service, idx) => (
                  <Card key={service.title} className="group hover:shadow-lg transition-all duration-300 hover:border-primary animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                        <Icon name={service.icon} className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="font-heading">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">{service.price}</span>
                      <Button variant="outline" size="sm">
                        Заказать
                        <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Интеграция с системами доставки</CardTitle>
                  <CardDescription>
                    Мы сотрудничаем с ведущими транспортными компаниями для быстрой и надежной доставки
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Icon name="Package" className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">CDEK</p>
                        <p className="text-xs text-muted-foreground">1-3 дня</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Icon name="Truck" className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">Boxberry</p>
                        <p className="text-xs text-muted-foreground">2-4 дня</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Icon name="Home" className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">Курьер</p>
                        <p className="text-xs text-muted-foreground">По городу</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                      <Icon name="MapPin" className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-semibold">Самовывоз</p>
                        <p className="text-xs text-muted-foreground">Бесплатно</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl font-bold mb-4">О компании</h2>
                  <p className="text-muted-foreground text-lg">
                    Ваш надежный партнер в области автомобильной безопасности
                  </p>
                </div>

                <Card className="mb-8 animate-fade-in">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">AutoSecure - защита вашего автомобиля</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      Мы специализируемся на продаже и установке автомобильных сигнализаций и дополнительного 
                      оборудования уже более 5 лет. За это время мы завоевали доверие более 500 клиентов 
                      по всей России.
                    </p>
                    <p>
                      Наша команда состоит из сертифицированных специалистов, которые проходят регулярное 
                      обучение у производителей оборудования. Мы работаем только с проверенными брендами 
                      и даем гарантию на все наши работы.
                    </p>
                    <p>
                      В нашем ассортименте представлены решения для любого бюджета - от базовых сигнализаций 
                      до премиальных систем безопасности с GPS-мониторингом и мобильным приложением.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="CheckCircle" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Качество</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Работаем только с оригинальным оборудованием от ведущих производителей
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="Users" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Опыт</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Наши мастера имеют более 7 лет опыта установки сигнализаций
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="text-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Icon name="Headphones" className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="font-heading">Поддержка</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Круглосуточная техническая поддержка для всех наших клиентов
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'contacts' && (
          <section className="py-20">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="font-heading text-3xl font-bold mb-4">Контакты</h2>
                  <p className="text-muted-foreground">
                    Свяжитесь с нами удобным способом
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Card className="animate-fade-in">
                      <CardHeader>
                        <CardTitle className="font-heading text-xl flex items-center gap-2">
                          <Icon name="Phone" className="h-5 w-5 text-primary" />
                          Телефон
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">8 (800) 555-35-35</p>
                        <p className="text-sm text-muted-foreground">Бесплатно по России</p>
                        <p className="text-lg font-semibold mt-2">8 (495) 123-45-67</p>
                        <p className="text-sm text-muted-foreground">Москва</p>
                      </CardContent>
                    </Card>

                    <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <CardHeader>
                        <CardTitle className="font-heading text-xl flex items-center gap-2">
                          <Icon name="Mail" className="h-5 w-5 text-primary" />
                          Email
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg">info@autosecure.ru</p>
                        <p className="text-sm text-muted-foreground">Ответим в течение 1 часа</p>
                      </CardContent>
                    </Card>

                    <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <CardHeader>
                        <CardTitle className="font-heading text-xl flex items-center gap-2">
                          <Icon name="MapPin" className="h-5 w-5 text-primary" />
                          Адрес
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg">г. Москва, ул. Автомобильная, 123</p>
                        <p className="text-sm text-muted-foreground">Пн-Пт: 9:00 - 20:00</p>
                        <p className="text-sm text-muted-foreground">Сб-Вс: 10:00 - 18:00</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="animate-scale-in">
                    <CardHeader>
                      <CardTitle className="font-heading text-xl">Форма обратной связи</CardTitle>
                      <CardDescription>
                        Оставьте заявку и мы свяжемся с вами в ближайшее время
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Input placeholder="Ваше имя" />
                        </div>
                        <div>
                          <Input type="tel" placeholder="Телефон" />
                        </div>
                        <div>
                          <Input type="email" placeholder="Email" />
                        </div>
                        <div>
                          <Textarea placeholder="Сообщение" rows={4} />
                        </div>
                        <Button className="w-full">
                          <Icon name="Send" className="mr-2 h-4 w-4" />
                          Отправить заявку
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t bg-muted/30 py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Icon name="Shield" className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-heading text-xl font-bold">AutoSecure</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Защита вашего автомобиля - наша главная задача
              </p>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Каталог</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-primary transition-colors">Сигнализации</button></li>
                <li><button className="hover:text-primary transition-colors">Автозапуск</button></li>
                <li><button className="hover:text-primary transition-colors">Датчики</button></li>
                <li><button className="hover:text-primary transition-colors">Камеры</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Компания</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-primary transition-colors">О нас</button></li>
                <li><button className="hover:text-primary transition-colors">Услуги</button></li>
                <li><button className="hover:text-primary transition-colors">Доставка</button></li>
                <li><button className="hover:text-primary transition-colors">Гарантия</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="Phone" className="h-4 w-4" />
                  8 (800) 555-35-35
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" className="h-4 w-4" />
                  info@autosecure.ru
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="MapPin" className="h-4 w-4" />
                  Москва, ул. Автомобильная
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 AutoSecure. Все права защищены.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon">
                <Icon name="Facebook" className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Instagram" className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Youtube" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index