import numpy as np
import cv2


def main():
    print('loading images...')
    image_path = ["pics/b-001.png",
                  "pics/b-002.png",
                  "pics/b-003.png",
                  "pics/b-004.png",
                  "pics/b-005.png"
                  ]
    images = []
    for path in image_path:
        images.append(cv2.imread(path))
    h, w = images[0].shape[:2]
    print(w, h)
    imRes = interlace(images, h, w)
    im=combine(images)
    write_image("test.png", imRes)
    cv2.imshow("Window Name", imRes)
    cv2.waitKey()
    cv2.destroyAllWindows()


def write_image(path, img):
    # img = img*(2**16-1)
    # img = img.astype(np.uint16)
    # img = img.astype(np.uint8)
    img = cv2.convertScaleAbs(img, alpha=(255.0))
    cv2.imwrite(path, img)

def interlace(images, h, w):
    inter = np.empty((h, w, 3), images[0].dtype)
    inter[:h, :w:5, :] = images[0][:h, :w:5, :]
    inter[:h, 1:w:5, :] = images[1][:h, 1:w:5, :]
    inter[:h, 2:w:5, :] = images[2][:h, 2:w:5, :]
    inter[:h, 3:w:5, :] = images[3][:h, 3:w:5, :]
    inter[:h, 4:w:5, :] = images[4][:h, 4:w:5, :]
    return inter.astype(np.float32) / 255

    b = np.float32(inter) / 255.0
    return b


def interlace_4px_line_5px_gap(images, h, w):
    inter = np.empty((h, w, 3), images[0].dtype)
    inter[:h, 300:int(np.ceil(h/2+300)), :] = images[0][:h,300:int(np.ceil(h/2+300)), :]

    # for i in range(0, len(inter[0])):
    return inter.astype(np.float32) / 255

def combine(images):
    im = cv2.addWeighted(images[0], 0.5, images[1], 0.5, 0.0)
    im = cv2.addWeighted(im, 0.5, images[2], 0.5, 0.0)
    im = cv2.addWeighted(im, 0.5, images[3], 0.5, 0.0)
    im = cv2.addWeighted(im, 0.5, images[4], 0.5, 0.0)
    return im


if __name__ == "__main__":
    main()