/* ==========================================================================
   Портфолио-резюме — интерактивные сценарии
   1. Валидация формы обратной связи
   2. Плавная прокрутка по якорям + активный пункт меню
   3. Анимация появления секций (IntersectionObserver)
   4. Кнопка «Наверх»
   5. Динамический год в копирайте
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

    /**
     * Показать ошибку под полем или очистить её.
     */
    function setFieldError(field, message) {
      field.error.textContent = message;
      field.input.classList.toggle('is-invalid', Boolean(message));
      field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    /**
     * Валидация одного поля.
     * @returns {boolean} true, если поле валидно.
     */
    function validateField(field) {
      const message = field.validate(field.input.value);
      setFieldError(field, message);
      return message === '';
    }

    // Валидация на лету после первого взаимодействия с полем
    Object.values(fields).forEach((field) => {
      field.input.addEventListener('blur', () => validateField(field));
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    // Обработка отправки
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

        // Фокус на первое невалидное поле
        const firstInvalid = Object.values(fields).find((f) =>
          f.input.classList.contains('is-invalid')
        );
        if (firstInvalid) firstInvalid.input.focus();
        return;
      }

      // Имитация успешной отправки (бэкенда нет)
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

      // Обновляем hash без прыжка
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  /**
   * Подсветка активного пункта меню при скролле.
   */
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
            observer.unobserve(entry.target); // анимируем один раз
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Фолбэк: если IntersectionObserver недоступен — показываем всё сразу
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
})();