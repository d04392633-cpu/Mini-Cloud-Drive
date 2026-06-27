package handlers

import (
	"io"
	"log"
	"mydrive/internal/repository"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type FileHendler struct {
	Files *repository.FileRepository
}

func NewFileHendler(file *repository.FileRepository) FileHendler {
	return FileHendler{Files: file}
}

func (h *FileHendler) Upload(c echo.Context) error {
	userID := c.Get("user_id").(float64)

	file, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "No file in the 'file' field.",
		})
	}

	src, err := file.Open()

	if err != nil {
		return err
	}

	defer src.Close()

	ext := filepath.Ext(file.Filename) // .jpg, .pdf
	diskName := uuid.New().String() + ext
	diskPath := filepath.Join("uploads", diskName)

	os.MkdirAll("uploads", os.ModePerm)

	dst, err := os.Create(diskPath)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "не удалось создать файл",
		})
	}
	defer dst.Close()

	size, err := io.Copy(dst, src)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "не удалось скопировать файл",
		})
	}

	id, err := h.Files.CreateFile(int(userID), diskName, file.Filename, size, diskPath)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "не удалось сохранить в DB",
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"id":       id,
		"fileName": diskName,
		"size":     size,
	})
}
func (h *FileHendler) FileList(c echo.Context) error {
	userID := c.Get("user_id").(float64)

	file, err := h.Files.GetAllFilesByUserID(int(userID))

	if err != nil {
		log.Printf("error getFileById: %v", err)
		return c.JSON(400, map[string]string{"error": "не удалось получить список"})

	}
	return c.JSON(200, file)
}

func (h *FileHendler) Download(c echo.Context) error {
	userID := int(c.Get("user_id").(float64))

	idString := c.Param("id")
	fileID, err := strconv.Atoi(idString)
	if err != nil {
		return c.JSON(401, map[string]string{"error": "неверный ID"})
	}

	file, err := h.Files.GetFileById(fileID)

	if file.UserID != userID {
		return c.JSON(400, map[string]string{
			"error": "нет доступа",
		})
	}
	return c.Attachment(file.UploadPath, file.OriginalName)
}

func (h *FileHendler) DeleteFile(c echo.Context) error {
	user_id := int(c.Get("user_id").(float64))

	idString := c.Param("id")
	fileID, err := strconv.Atoi(idString)
	if err != nil {
		return c.JSON(401, map[string]string{"error": "неверный ID"})
	}

	file, err :=h.Files.GetFileById(fileID)
	if err != nil{
		return c.JSON(404, map[string]string{
			"error":"файл не найден",
		})}

	if file.UserID != user_id {
		return c.JSON(400, map[string]string{"error":"файл не принадлежит вам"})
	}

	err = os.Remove(file.UploadPath)
	if err != nil {
		log.Printf("ошибка удаления файло локально: %v", err)
	}
	err = h.Files.DeleteFileByID(fileID)
	if err != nil {
		return c.JSON(500, map[string]string{
			"error":"не удалось удалить файл",
		})
	}
	return c.JSON(200, map[string]string{
		"massege":"файл успешно удален",
	})
}