// src/components/layout/footer.tsx
export function Footer() {
    return (
      <footer className="border-t py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 SA Textbook Solutions. All rights reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Contact
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }