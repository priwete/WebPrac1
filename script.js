/* ==========================================================================
   Портфолио-резюме — интерактивные сценарии
   1. Валидация формы обратной связи
   2. Плавная прокрутка по якорям + активный пункт меню
   3. Анимация появления секций (IntersectionObserver)
   4. Кнопка «Наверх»
   5. Динамический год в копирайте
   6. Лайтбокс со слайдером для проектов
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. Форма обратной связи: валидация и «отправка»
     ======================================================================== */

  const form = document.getElementById('contact-form');

  if (form) {
    const fields = {
      name: {
        input: document.getElementById('name'),
        error: document.getElementById('name-error'),
        validate: (value) => {
          if (!value.trim()) return 'Укажите имя.';
          if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа.';
          return '';
        }
      },
      email: {
        input: document.getElementById('email'),
        error: document.getElementById('email-error'),
        validate: (value) => {
          if (!value.trim()) return 'Укажите email.';
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!pattern.test(value.trim())) return 'Введите корректный email, например name@example.com.';
          return '';
        }
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('message-error'),
        validate: (value) => {
          if (!value.trim()) return 'Напишите сообщение.';
          if (value.trim().length < 10) return 'Сообщение должно содержать минимум 10 символов.';
          return '';
        }
      }
    };

    const statusEl = document.getElementById('form-status');

    function setFieldError(field, message) {
      field.error.textContent = message;
      field.input.classList.toggle('is-invalid', Boolean(message));
      field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validateField(field) {
      const message = field.validate(field.input.value);
      setFieldError(field, message);
      return message === '';
    }

    Object.values(fields).forEach((field) => {
      field.input.addEventListener('blur', () => validateField(field));
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let isValid = true;
      Object.values(fields).forEach((field) => {
        if (!validateField(field)) isValid = false;
      });

      statusEl.classList.remove('is-success', 'is-error');

      if (!isValid) {
        statusEl.textContent = 'Проверьте выделенные поля и попробуйте снова.';
        statusEl.classList.add('is-error');
        const firstInvalid = Object.values(fields).find((f) =>
          f.input.classList.contains('is-invalid')
        );
        if (firstInvalid) firstInvalid.input.focus();
        return;
      }

      statusEl.textContent = 'Сообщение готово к отправке. Спасибо за обращение!';
      statusEl.classList.add('is-success');

      form.reset();
      Object.values(fields).forEach((field) => setFieldError(field, ''));
    });
  }

  /* ========================================================================
     2. Плавная прокрутка по якорям + активный пункт меню
     ======================================================================== */

  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href');
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === id);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ========================================================================
     3. Анимация появления секций (IntersectionObserver)
     ======================================================================== */

  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ========================================================================
     4. Кнопка «Наверх»
     ======================================================================== */

  const toTop = document.getElementById('to-top');

  if (toTop) {
    const toggleToTop = () => {
      const shouldShow = window.scrollY > 400;
      toTop.classList.toggle('is-visible', shouldShow);
    };

    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();

    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ========================================================================
     5. Динамический год в копирайте
     ======================================================================== */

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ========================================================================
     6. Лайтбокс со слайдером для проектов
     ======================================================================== */

  const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  const lightbox = document.getElementById('lightbox');

  if (triggers.length && lightbox) {
    const imageEl = document.getElementById('lightbox-image');
    const titleEl = document.getElementById('lightbox-title');
    const counterEl = document.getElementById('lightbox-counter');
    const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
    const nextBtn = lightbox.querySelector('[data-lightbox-next]');
    const closeBtns = lightbox.querySelectorAll('[data-lightbox-close]');

    let currentIndex = 0;
    let lastFocused = null;

    /**
     * Достать URL фоновой картинки у кнопки-плейсхолдера.
     * Возвращает строку url(...) или пустую строку.
     */
    function getBackgroundImage(el) {
      const style = window.getComputedStyle(el);
      return style.backgroundImage || '';
    }

    /**
     * Отрисовать текущий слайд.
     */
    function renderSlide() {
      const trigger = triggers[currentIndex];
      if (!trigger) return;

      const bg = getBackgroundImage(trigger);
      imageEl.style.backgroundImage = bg;
      titleEl.textContent = trigger.dataset.title || '';
      counterEl.textContent = (currentIndex + 1) + ' / ' + triggers.length;

      // Обновляем alt через aria-label у контейнера
      imageEl.setAttribute(
        'aria-label',
        trigger.dataset.title || 'Изображение проекта'
      );
    }

    /**
     * Открыть лайтбокс на конкретном индексе.
     */
    function openLightbox(index) {
      currentIndex = index;
      lastFocused = document.activeElement;

      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';

      renderSlide();

      // Фокус на кнопку закрытия — так удобнее для клавиатуры
      const closeBtn = lightbox.querySelector('.lightbox__close');
      if (closeBtn) closeBtn.focus();
    }

    /**
     * Закрыть лайтбокс.
     */
    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      imageEl.style.backgroundImage = '';

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    /**
     * Перейти к следующему/предыдущему слайду с зацикливанием.
     */
    function showNext() {
      currentIndex = (currentIndex + 1) % triggers.length;
      renderSlide();
    }
    function showPrev() {
      currentIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      renderSlide();
    }

    // Клики по плейсхолдерам
    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => openLightbox(index));
    });

    // Кнопки управления
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    // Закрытие: крестик и клик по фону
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', closeLightbox);
    });

    // Клавиатура
    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        showNext();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      }
    });
  }
})();
