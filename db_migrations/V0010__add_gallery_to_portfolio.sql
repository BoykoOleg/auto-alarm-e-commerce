-- Добавляем поле для галереи изображений
ALTER TABLE portfolio_works 
ADD COLUMN gallery_urls TEXT[];

-- Переносим существующие image_url в gallery_urls
UPDATE portfolio_works 
SET gallery_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL AND image_url != '';

-- Оставляем image_url для обратной совместимости (первое фото галереи)
COMMENT ON COLUMN portfolio_works.gallery_urls IS 'Массив URL фотографий (до 10 шт)';
COMMENT ON COLUMN portfolio_works.image_url IS 'Главное изображение (первое из gallery_urls для совместимости)';
