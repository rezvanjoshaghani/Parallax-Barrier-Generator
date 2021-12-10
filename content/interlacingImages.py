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
    images=[]
    for path in image_path:
        images.append(cv2.imread(path))
    h, w = images[0].shape[:2]
    print(h, w)
    imRes= interlace(images, h, w)
    cv2.imwrite("test.png",imRes )
    cv2.imshow("Window Name",imRes)
    cv2.waitKey()
    cv2.destroyAllWindows()


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


# def interlace(images, h, w):
#     inter = np.empty((h, w, 3), images[0].dtype)
#     for i in range(0,len(images)):
#         inter[:h, i:w:5, :] = images[0][:h, i:w:5, :]
#     return inter.astype(np.float32) / 255
#
#     b = np.float32(inter) / 255.0
#     return b


if __name__ == "__main__":
    main()
