// src/components/product/ImageGallery/ImageGallery.jsx
// Product image gallery: vertical thumbnail strip on the left,
// large main image on the right — matches LUMINA___Product_Details.png.
// Support clicking the main image to open a premium fullscreen zoom lightbox.

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { productImageUrl } from "@utils/imageUrl";
import styles from "./ImageGallery.module.css";

function ImageGallery({ imageCover, images = [], productName = "", isOutOfStock = false }) {
  const allImages = [imageCover, ...images].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMagnified, setIsMagnified] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 50, y: 50 });

  const activeUrl = productImageUrl(allImages[activeIndex]);
  const lightboxUrl = productImageUrl(allImages[lightboxIndex]);

  // Sync keyboard controls for lightbox navigation and close
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsMagnified(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % allImages.length);
        setIsMagnified(false);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        setIsMagnified(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  const openLightbox = () => {
    setLightboxIndex(activeIndex);
    setIsLightboxOpen(true);
  };

  const closeLightbox = (e) => {
    // Only close if clicking the backdrop, close button, or background wrappers
    if (e.target.classList.contains(styles.lightbox) || e.target.classList.contains(styles.closeBtn) || e.target.classList.contains(styles.lightboxImageWrap)) {
      setIsLightboxOpen(false);
      setIsMagnified(false);
    }
  };

  // Magnification panning handler
  const handleMouseMove = (e) => {
    if (!isMagnified) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPanOffset({ x, y });
  };

  const toggleMagnify = (e) => {
    e.stopPropagation();
    setIsMagnified((prev) => !prev);
  };

  return (
    <div className={styles.gallery}>
      {/* ── Thumbnail Strip ── */}
      {allImages.length > 1 && (
        <div
          className={styles.thumbnails}
          role="tablist"
          aria-label="Product images"
        >
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`View image ${i + 1}`}
              className={[
                styles.thumb,
                i === activeIndex ? styles.thumbActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveIndex(i)}
            >
              <img
                src={productImageUrl(img)}
                alt={`${productName} — view ${i + 1}`}
                className={styles.thumbImg}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main Image ── */}
      <div
        className={styles.mainWrap}
        role="tabpanel"
        onClick={!isOutOfStock ? openLightbox : undefined}
        style={{ cursor: !isOutOfStock ? "zoom-in" : "default" }}
      >
        <img
          key={activeUrl} /* key change triggers CSS fade-in */
          src={activeUrl}
          alt={productName}
          className={[styles.mainImage, isOutOfStock ? styles.dimmed : ""].filter(Boolean).join(" ")}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          }}
        />
        {isOutOfStock && (
          <div className={styles.soldOutOverlay}>
            <span className={styles.soldOutText}>SOLD OUT</span>
          </div>
        )}
      </div>

      {/* ── Fullscreen Zoom Lightbox Modal ── */}
      {isLightboxOpen && createPortal(
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeLightbox}
            aria-label="Close zoom overlay"
          >
            ✕
          </button>

          {/* Left Arrow */}
          {allImages.length > 1 && (
            <button
              type="button"
              className={styles.arrowLeft}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                setIsMagnified(false);
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Image Wrapper Container */}
          <div
            className={styles.lightboxImageWrap}
            onMouseMove={handleMouseMove}
            onClick={toggleMagnify}
          >
            <img
              src={lightboxUrl}
              alt={`${productName} zoomed`}
              className={[
                styles.lightboxImage,
                isMagnified ? styles.magnified : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                isMagnified
                  ? {
                      transformOrigin: `${panOffset.x}% ${panOffset.y}%`,
                    }
                  : undefined
              }
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
              }}
            />
          </div>

          {/* Right Arrow */}
          {allImages.length > 1 && (
            <button
              type="button"
              className={styles.arrowRight}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev + 1) % allImages.length);
                setIsMagnified(false);
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Lightbox Thumbnails Navigation (Vertical or horizontal at the bottom) */}
          {allImages.length > 1 && (
            <div className={styles.lightboxThumbs}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={[
                    styles.lightboxThumb,
                    i === lightboxIndex ? styles.lightboxThumbActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                    setIsMagnified(false);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                >
                  <img src={productImageUrl(img)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default ImageGallery;
