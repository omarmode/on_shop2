"use client";
import { useEffect, useState } from "react";
import {
  Draggable,
  DragDropContext,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import LoadingSkeleton from "./LoadingSkeleton";
import { DndContext } from "@/context/DndContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const cardsData = [
  {
    id: 0,
    title: "Banners",
    components: [
      {
        id: 100,
        name: "Banners",
        images: [
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720339525/banner-1_ocdzvu.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720339530/banner-2_s4y8tg.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720339527/banner-3_saqmcd.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720339533/banner-4_kiwju3.png",
        ],
      },
    ],
  },
  {
    id: 1,
    title: "Categories",
    components: [
      {
        id: 200,
        name: "Categories",
        images: [
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720340536/cat-1_jplhmk.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720340537/cat-2_acxrqu.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720340530/cat-3_fvrvsw.png",
          "https://res.cloudinary.com/dyufmizpc/image/upload/v1720340530/cat-4_hls1km.png",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Products",
    components: [
      {
        id: 300,
        name: "Products",
        images: [
          "https://res.cloudinary.com/dgswngo1l/image/upload/v1720340304/aa/p11_gyrkvv.png",
          "https://res.cloudinary.com/dgswngo1l/image/upload/v1720340474/aa/p22_puppds.png",
        ],
      },
    ],
  },
  { id: 3, title: "Preview", components: [] },
];

interface Cards {
  id: number;
  title: string;
  components: {
    id: number;
    name: string;
    images: string[];
  }[];
}

const DndExample = () => {
  const [data, setData] = useState<Cards[]>([]);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [draggedImages, setDraggedImages] = useState<Set<string>>(new Set());

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDroppableId = parseInt(
      source.droppableId.replace("droppable", "")
    );
    const destinationDroppableId = parseInt(
      destination.droppableId.replace("droppable", "")
    );

    const newData = [...data];

    const sourceIndex = newData.findIndex((x) => x.id === sourceDroppableId);
    const destinationIndex = newData.findIndex(
      (x) => x.id === destinationDroppableId
    );

    const [movedImage] = newData[sourceIndex].components[0].images.splice(
      source.index,
      1
    );

    // Check if moving to Preview
    if (destinationDroppableId === 3) {
      // Check if there is already an image in Preview
      const hasImageInPreview =
        Array.isArray(newData[destinationIndex]?.components[0]?.images) &&
        newData[destinationIndex].components[0].images.length > 0;

      // If there is already an image in Preview, return the moved image back to its original section
      if (hasImageInPreview) {
        newData[sourceIndex].components[0].images.splice(
          source.index,
          0,
          movedImage
        );
        return;
      }

      // Check if there is already an image from the same section in Preview
      const sectionName = newData[sourceIndex].title.toLowerCase();
      const hasSectionImageInPreview = newData[3]?.components[0]?.images?.some(
        (image: any) => {
          if (
            typeof image === "object" &&
            image !== null &&
            typeof image.section === "string"
          ) {
            return image.section === sectionName;
          }
          return false;
        }
      );

      // If there is already an image from the same section in Preview, return the moved image back to its original section
      if (hasSectionImageInPreview) {
        newData[sourceIndex].components[0].images.splice(
          source.index,
          0,
          movedImage
        );
        return;
      }
    }

    // Allow moving to Preview if it's the first image or if moving from another section
    if (destinationDroppableId === 3) {
      if (newData[destinationIndex].components.length === 0) {
        newData[destinationIndex].components.push({
          id: new Date().getTime(),
          name: "Moved Image",
          images: [movedImage],
        });
      } else if (newData[destinationIndex].components[0].images.length === 0) {
        newData[destinationIndex].components[0].images = [movedImage];
      }
    } else {
      // Moving from Preview or within the same section
      if (newData[destinationIndex].components.length === 0) {
        newData[destinationIndex].components.push({
          id: new Date().getTime(),
          name: "Moved Image",
          images: [movedImage],
        });
      } else {
        newData[destinationIndex].components[0].images.splice(
          destination.index,
          0,
          movedImage
        );
      }
    }

    // Update state
    setData(newData);
  };

  const logPreviewItems = () => {
    console.log(previewItems);
  };

  const handleReturnToOriginal = (imageIndex: number) => {
    const imageToReturn = data[3].components[0].images[imageIndex];
    const originalSection = data.find((group) =>
      group.components.some((component) =>
        component.images.includes(imageToReturn)
      )
    );
    const originalSectionIndex = data.findIndex(
      (group) => group === originalSection
    );

    const newPreviewImages = [...data[3].components[0].images];
    newPreviewImages.splice(imageIndex, 1);

    const newData = [...data];
    newData[3].components[0].images = newPreviewImages;
    newData[originalSectionIndex].components[0].images.push(imageToReturn);

    setData(newData);
    setPreviewItems(
      newData[3].components[0].images.map((image) => {
        const section = newData.find((group) =>
          group.components.some((component) => component.images.includes(image))
        )?.title;
        const value = image.split("/").pop()?.split("_")[0];
        return { section, value };
      })
    );
  };

  useEffect(() => {
    setData(cardsData);
  }, []);

  if (!data.length) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="bg-gray-300 h-16 flex justify-between items-center px-20">
        <div className="font-bold">On Shop</div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2 px-4 rounded flex items-center"
          onClick={logPreviewItems}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4 mr-1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          Save Changes
        </button>
      </div>
      <DndContext onDragEnd={onDragEnd}>
        <div className="py-16 px-4 flex flex-col lg:flex-row gap-4">
          {/* Group 1, Group 2, and Group 3 */}
          <div className="lg:flex lg:flex-col w-full ">
            {data.slice(0, 3).map((group, groupIndex) => (
              <div key={group.id} className="w-full mb-4">
                <Droppable droppableId={`droppable${groupIndex}`}>
                  {(provided) => (
                    <Accordion
                      type="multiple"
                      className="w-full p-4"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <AccordionItem value={group.title.toLowerCase()}>
                        <AccordionTrigger>{group.title}</AccordionTrigger>
                        <AccordionContent>
                          {group.components[0].images.map((image, index) => (
                            <Draggable
                              key={`${group.components[0].id}-${index}`}
                              draggableId={`${group.components[0].id}-${index}`}
                              index={index}
                              isDragDisabled={draggedImages.has(
                                group.id.toString()
                              )}
                            >
                              {(provided) => (
                                <div
                                  className="my-3 border-b-2 pb-3"
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  <img
                                    src={image}
                                    alt={`image-${index}`}
                                    className="w-full h-auto"
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                      {provided.placeholder}
                    </Accordion>
                  )}
                </Droppable>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="w-full">
            <Droppable droppableId="droppable3">
              {(provided) => (
                <div
                  className="p-5 bg-white min-h-[50vh] border-2 border-black border-dashed"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h2 className="text-center font-bold mb-6 text-black">
                    {data[3].title}
                  </h2>
                  {data[3].components.length > 0 &&
                    data[3].components[0].images.map((image, index) => (
                      <Draggable
                        key={`preview-${index}`}
                        draggableId={`preview-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="py-3 my-3 mx-0 px-0 border-b-2 pb-3"
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <img
                              src={image}
                              alt={`preview-${index}`}
                              className="w-full h-auto"
                              onClick={() => handleReturnToOriginal(index)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DndContext>
    </>
  );
};

export default DndExample;
