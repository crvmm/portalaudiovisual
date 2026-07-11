-- Languages
INSERT INTO languages (code, name) VALUES
  ('es', 'Español'),
  ('en', 'Inglés'),
  ('ca', 'Catalán'),
  ('eu', 'Euskera'),
  ('gl', 'Gallego'),
  ('fr', 'Francés'),
  ('de', 'Alemán'),
  ('it', 'Italiano'),
  ('pt', 'Portugués');

-- Main audiovisual categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Fotografía', 'fotografia', 1),
  ('Vídeo', 'video', 2),
  ('Dirección', 'direccion', 3),
  ('Producción', 'produccion', 4),
  ('Edición de vídeo', 'edicion-video', 5),
  ('Postproducción', 'postproduccion', 6),
  ('Sonido', 'sonido', 7),
  ('Animación', 'animacion', 8),
  ('Diseño gráfico', 'diseno-grafico', 9),
  ('Efectos visuales', 'efectos-visuales', 10),
  ('Creación de contenido', 'creacion-contenido', 11),
  ('Arte y diseño', 'arte-diseno', 12);

-- Photography subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Fotografía de producto', 'fotografia-producto', 1),
  ('Fotografía de eventos', 'fotografia-eventos', 2),
  ('Fotografía de moda', 'fotografia-moda', 3),
  ('Fotografía documental', 'fotografia-documental', 4),
  ('Fotografía inmobiliaria', 'fotografia-inmobiliaria', 5)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'fotografia';

-- Video subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Cámara', 'camara', 1),
  ('Operación de cámara', 'operacion-camara', 2),
  ('Realización', 'realizacion', 3),
  ('Dron', 'dron', 4),
  ('Streaming', 'streaming', 5),
  ('Retransmisión de eventos', 'retransmision-eventos', 6)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'video';

-- Direction subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Dirección de fotografía', 'direccion-fotografia', 1),
  ('Dirección de arte', 'direccion-arte', 2),
  ('Guion', 'guion', 3)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'direccion';

-- Production subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Producción ejecutiva', 'produccion-ejecutiva', 1),
  ('Ayudante de producción', 'ayudante-produccion', 2)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'produccion';

-- Postproduction subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Corrección de color', 'correccion-color', 1),
  ('Motion graphics', 'motion-graphics', 2)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'postproduccion';

-- Sound subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Grabación de sonido', 'grabacion-sonido', 1),
  ('Mezcla de sonido', 'mezcla-sonido', 2),
  ('Diseño sonoro', 'diseno-sonoro', 3),
  ('Locución', 'locucion', 4),
  ('Iluminación', 'iluminacion', 5)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'sonido';

-- Animation subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Modelado 3D', 'modelado-3d', 1),
  ('Animación 3D', 'animacion-3d', 2)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'animacion';

-- Art & design subcategories
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT c.id, sub.name, sub.slug, sub.sort_order
FROM categories c
CROSS JOIN (VALUES
  ('Escenografía', 'escenografia', 1),
  ('Vestuario', 'vestuario', 2),
  ('Maquillaje y caracterización', 'maquillaje-caracterizacion', 3)
) AS sub(name, slug, sort_order)
WHERE c.slug = 'arte-diseno';

-- Common tools
INSERT INTO tools (name, category) VALUES
  ('Adobe Photoshop', 'edición'),
  ('Adobe Lightroom', 'fotografía'),
  ('Adobe Premiere Pro', 'edición'),
  ('Adobe After Effects', 'motion'),
  ('DaVinci Resolve', 'edición'),
  ('Final Cut Pro', 'edición'),
  ('Avid Media Composer', 'edición'),
  ('Blender', '3D'),
  ('Cinema 4D', '3D'),
  ('Maya', '3D'),
  ('Pro Tools', 'audio'),
  ('Logic Pro', 'audio'),
  ('Ableton Live', 'audio'),
  ('Adobe Illustrator', 'diseño'),
  ('Figma', 'diseño'),
  ('Capture One', 'fotografía');

-- Common equipment
INSERT INTO equipment (name, category) VALUES
  ('Cámara DSLR', 'cámara'),
  ('Cámara mirrorless', 'cámara'),
  ('Cámara de cine', 'cámara'),
  ('Dron', 'aéreo'),
  ('Gimbal', 'estabilización'),
  ('Trípode', 'soporte'),
  ('Iluminación LED', 'iluminación'),
  ('Micrófono de solapa', 'audio'),
  ('Grabadora de audio', 'audio'),
  ('Estudio de grabación', 'audio');
