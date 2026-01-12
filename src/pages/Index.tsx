import { useState } from "react";
import { Header } from "@/components/sections/Header";
import { HomeSection } from "@/components/sections/HomeSection";
import { MainSections } from "@/components/sections/MainSections";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCarBrand, setSelectedCarBrand] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    car: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const categories = [
    { id: "all", name: "Все товары", icon: "Grid3x3" },
    { id: "signaling", name: "Сигнализации", icon: "Shield" },
    { id: "autostart", name: "Предпусковой подогрев", icon: "Power" },
    { id: "sensors", name: "Датчики", icon: "Activity" },
    { id: "cameras", name: "Камеры", icon: "Camera" },
  ];

  const products = [
    {
      id: 1,
      name: "StarLine S96 V2",
      category: "signaling",
      price: "20700 ₽",
      description: "Автосигнализация и автозапуском с мобильным приложением",
      features: ["Bluetooth", "Автозапуск", "GSM"],
      popular: true,
    },
    {
      id: 2,
      name: "Pandora 4VX GPS",
      category: "signaling",
      price: "29 300 ₽",
      description: "Премиум сигнализация с мобильным приложением и GPS антеной",
      features: ["GSM", "GPS", "CAN"],
      popular: true,
    },
    {
      id: 3,
      name: "Webasto Thermo Top",
      category: "autostart",
      price: "32 000 ₽",
      description: "Автономный подогреватель двигателя",
      features: ["Таймер", "GSM", "Дистанционный запуск"],
      popular: true,
    },
    {
      id: 4,
      name: "Датчик удара",
      category: "sensors",
      price: "2 900 ₽",
      description: "Двухзонный датчик удара",
      features: ["Регулировка", "2 зоны", "Светодиод"],
    },
    {
      id: 5,
      name: "Видеорегистратор 4K",
      category: "cameras",
      price: "8 500 ₽",
      description: "Видеорегистратор с GPS",
      features: ["4K", "GPS", "Wi-Fi"],
      popular: true,
    },
    {
      id: 6,
      name: "Парктроник 8 датчиков",
      category: "sensors",
      price: "5 200 ₽",
      description: "Парковочная система",
      features: ["8 датчиков", "LCD дисплей", "Звук"],
    },
  ];

  const services = [
    {
      title: "Установка сигнализаций",
      description:
        "Профессиональная установка любых автосигнализаций с гарантией",
      price: "от 3 000 ₽",
      icon: "Settings",
    },
    {
      title: "Диагностика систем",
      description: "Полная диагностика электронных систем автомобиля",
      price: "от 1 500 ₽",
      icon: "Search",
    },
    {
      title: "Ремонт и настройка",
      description: "Ремонт и настройка сигнализаций, автозапуска",
      price: "от 2 000 ₽",
      icon: "Wrench",
    },
    {
      title: "Консультация",
      description: "Подбор оптимального решения для вашего автомобиля",
      price: "Бесплатно",
      icon: "MessageCircle",
    },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main>
        {activeSection === "home" && (
          <HomeSection setActiveSection={setActiveSection} />
        )}

        <MainSections
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCarBrand={selectedCarBrand}
          setSelectedCarBrand={setSelectedCarBrand}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          submitStatus={submitStatus}
          setSubmitStatus={setSubmitStatus}
          categories={categories}
          filteredProducts={filteredProducts}
          services={services}
        />
      </main>

      <Footer setActiveSection={setActiveSection} />
    </div>
  );
};

export default Index;
