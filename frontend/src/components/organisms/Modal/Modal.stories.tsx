import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button } from '../../atoms/Button/Button';
import { FormField } from '../../molecules/FormField/FormField';

const meta = {
  title: 'Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        iframeHeight: 500,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: '모달 열림 상태',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: '모달 크기',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: '오버레이 클릭 시 닫기',
    },
    hideCloseButton: {
      control: 'boolean',
      description: '닫기 버튼 숨김',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Modal (항상 열린 상태)
 */
export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    title: 'Modal Title',
    children: <p>This is a basic modal with default settings.</p>,
  },
  parameters: {
    controls: {
      exclude: ['isOpen'],
    },
  },
};

/**
 * Interactive Modal (버튼으로 열기)
 */
export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
          <p>This is a basic modal with default settings.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * With Footer
 */
export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal with Footer</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <p>Are you sure you want to proceed with this action?</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * Small Size
 */
export const SmallSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Small Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Small Modal" size="sm">
          <p>This is a small modal.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * Large Size
 */
export const LargeSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Large Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Large Modal" size="lg">
          <p>This is a large modal with more content space.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * Form Modal (실제 사용 예시)
 */
export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Add Ingredient</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add New Ingredient"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Add Ingredient
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField id="name" label="Ingredient Name" type="input" required placeholder="e.g., Lavender Essential Oil" />
            <FormField
              id="note"
              label="Note Family"
              type="select"
              required
            >
              <option value="">Select note family...</option>
              <option value="top">Top Note</option>
              <option value="middle">Middle Note</option>
              <option value="base">Base Note</option>
            </FormField>
            <FormField
              id="description"
              label="Description"
              type="textarea"
              rows={4}
              placeholder="Describe the scent profile..."
            />
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * Scrollable Content
 */
export const ScrollableContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Scrollable Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Long Content">
          <div>
            {Array.from({ length: 20 }).map((_, i) => (
              <p key={i} style={{ marginBottom: '1rem' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Paragraph {i + 1}.
              </p>
            ))}
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * No Close Button
 */
export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Important Message"
          hideCloseButton
          closeOnOverlayClick={false}
          footer={
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              I Understand
            </Button>
          }
        >
          <p>You must acknowledge this message before proceeding.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * Delete Confirmation
 */
export const DeleteConfirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Delete Item
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete Confirmation"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert('Deleted!');
                  setIsOpen(false);
                }}
                style={{ backgroundColor: 'var(--color-error)' }}
              >
                Delete
              </Button>
            </>
          }
        >
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

/**
 * With Footer (Always Open for Docs)
 */
export const WithFooterAlwaysOpen: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    title: 'Confirm Action',
    footer: (
      <>
        <Button variant="outline" onClick={() => console.log('Cancel')}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => console.log('Confirm')}>
          Confirm
        </Button>
      </>
    ),
    children: <p>Are you sure you want to proceed with this action?</p>,
  },
  parameters: {
    controls: {
      exclude: ['isOpen'],
    },
  },
};

/**
 * Custom Content with Subcomponents
 */
export const CustomContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Custom Modal</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
          <ModalHeader>
            <h2 style={{ margin: 0 }}>Custom Header</h2>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </ModalHeader>
          <ModalBody>
            <p>This modal uses custom subcomponents for more control.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: { disable: true },
  },
};
